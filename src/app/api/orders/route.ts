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

// POST /api/orders — Create a new ticket order
export async function POST(request: NextRequest) {
    const user = await getAuthUser(request)
    if (!user) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { event_id, zone, quantity } = await request.json()

    if (!event_id || !zone || !quantity) {
        return NextResponse.json({ error: "event_id, zone et quantity sont requis" }, { status: 400 })
    }

    // Get event to calculate price
    const { data: event } = await supabase
        .from("events")
        .select("price_vip, price_tribune, price_pelouse, status")
        .eq("id", event_id)
        .single()

    if (!event) {
        return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 })
    }

    if (event.status !== "published") {
        return NextResponse.json({ error: "Cet événement n'est plus disponible" }, { status: 400 })
    }

    const zonePrices: Record<string, number> = {
        VIP: event.price_vip,
        TRIBUNE: event.price_tribune,
        PELOUSE: event.price_pelouse
    }

    const zoneUpper = zone.toUpperCase()
    const unitPrice = zonePrices[zoneUpper]

    if (!unitPrice) {
        return NextResponse.json({ error: "Zone invalide. Choisissez VIP, TRIBUNE ou PELOUSE" }, { status: 400 })
    }

    const total_price = unitPrice * quantity

    // Generate unique QR code
    const qr_code = `SL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const { data: ticket, error } = await supabase
        .from("tickets")
        .insert({
            user_id: user.id,
            event_id,
            zone: zoneUpper,
            quantity,
            total_price,
            qr_code,
            status: "pending"
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
