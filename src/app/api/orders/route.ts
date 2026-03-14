import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// Helper: get authenticated user from Bearer token
async function getAuthUser(request: NextRequest) {
    const supabase = createServerClient()
    const authorization = request.headers.get("authorization")
    if (!authorization) return null

    const token = authorization.replace("Bearer ", "")
    const { data: { user } } = await supabase.auth.getUser(token)
    return user
}

// Helper: normalize zone name to match database keys
function normalizeZoneKey(zone: string): string {
    const zoneMap: Record<string, string> = {
        "VIP": "vip",
        "TRIBUNE": "tribune",
        "PELOUSE": "pelouse",
        "TRIBUNE_COUVERTE": "tribune_couverte",
        "TRIBUNE_DÉCOUVERTE": "tribune_decouverte",
        "TRIBUNE_DECOUVERTE": "tribune_decouverte",
        "TICKET_SIMPLE": "ticket_simple",
        "LOGE_PRESTIGE": "loge_prestige",
    }
    return zoneMap[zone.toUpperCase()] || zone.toLowerCase()
}

// POST /api/orders — Create a new ticket order
export async function POST(request: NextRequest) {
    const user = await getAuthUser(request)
    
    const supabase = createServerClient()
    const { event_id, zone, quantity, buyerInfo } = await request.json()

    if (!event_id || !zone || !quantity) {
        return NextResponse.json({ error: "event_id, zone et quantity sont requis" }, { status: 400 })
    }

    // Get event with pricing and seats info
    const { data: event } = await supabase
        .from("events")
        .select("price_vip, price_tribune, price_pelouse, pricing, pricing_labels, seats, status")
        .eq("id", event_id)
        .single()

    if (!event) {
        return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 })
    }

    if (event.status !== "published") {
        return NextResponse.json({ error: "Cet événement n'est plus disponible" }, { status: 400 })
    }

    const zoneKey = normalizeZoneKey(zone)
    const zoneUpper = zone.toUpperCase()
    
    // Get price from new pricing JSONB or fall back to old columns
    let unitPrice = 0
    if (event.pricing && event.pricing[zoneKey]) {
        unitPrice = event.pricing[zoneKey]
    } else {
        // Fallback to old columns
        const zonePrices: Record<string, number> = {
            VIP: event.price_vip,
            TRIBUNE: event.price_tribune,
            PELOUSE: event.price_pelouse
        }
        unitPrice = zonePrices[zoneUpper] || 0
    }

    if (!unitPrice) {
        return NextResponse.json({ error: "Zone invalide ou prix non défini" }, { status: 400 })
    }

    // Check seat availability
    let maxSeats = 0
    if (event.seats && event.seats[zoneKey]) {
        maxSeats = event.seats[zoneKey]
    }
    
    // If seats are defined, check availability
    if (maxSeats > 0) {
        // Count sold tickets for this zone
        const { data: soldTickets } = await supabase
            .from("tickets")
            .select("quantity")
            .eq("event_id", event_id)
            .eq("zone", zoneUpper)
            .in("status", ["confirmed", "used"])
        
        const soldCount = (soldTickets || []).reduce((sum, t) => sum + (t.quantity || 1), 0)
        const remainingSeats = maxSeats - soldCount
        
        if (remainingSeats <= 0) {
            return NextResponse.json({ 
                error: "Tickets non disponibles pour cette zone",
                sold_out: true 
            }, { status: 400 })
        }
        
        if (quantity > remainingSeats) {
            return NextResponse.json({ 
                error: `Seulement ${remainingSeats} place(s) disponible(s) pour cette zone`,
                remaining: remainingSeats
            }, { status: 400 })
        }
    }

    const total_price = unitPrice * quantity

    // Generate unique QR code
    const qr_code = `SL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const { data: ticket, error } = await supabase
        .from("tickets")
        .insert({
            user_id: user?.id || null,
            event_id,
            zone: zoneUpper,
            quantity,
            total_price,
            qr_code,
            status: "pending",
            buyer_name: buyerInfo?.firstName && buyerInfo?.lastName 
                ? `${buyerInfo.firstName} ${buyerInfo.lastName}` 
                : "Acheteur invité",
            buyer_phone: buyerInfo?.whatsapp ? `+221${buyerInfo.whatsapp}` : null,
            buyer_email: buyerInfo?.email || null
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // TODO: In Phase 2, initiate CinetPay payment here and return payment URL
    // For now, auto-confirm (simulation)
    await supabase
        .from("tickets")
        .update({ status: "confirmed" })
        .eq("id", ticket.id)

    return NextResponse.json({
        ticket: { ...ticket, status: "confirmed" },
        // payment_url: "..." // will be added in Phase 2 with CinetPay
    }, { status: 201 })
}
