import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/events/[id]/availability — Get seat availability for an event
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    // Get event with seats and pricing info
    const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id, seats, pricing, pricing_labels, status")
        .eq("id", id)
        .single()

    if (eventError || !event) {
        return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 })
    }

    // Get sold tickets count per zone
    const { data: tickets } = await supabase
        .from("tickets")
        .select("zone, quantity")
        .eq("event_id", id)
        .in("status", ["confirmed", "used"])

    // Aggregate sold count by zone
    const soldByZone: Record<string, number> = {}
    ;(tickets || []).forEach(t => {
        const zoneKey = t.zone?.toLowerCase() || t.zone
        soldByZone[zoneKey] = (soldByZone[zoneKey] || 0) + (t.quantity || 1)
    })

    // Build availability response
    const seats = event.seats || {}
    const pricing = event.pricing || {}
    const pricingLabels = event.pricing_labels || {}

    const availability: Record<string, {
        label: string
        price: number
        total: number
        sold: number
        remaining: number
        available: boolean
    }> = {}

    // Process each zone from pricing
    Object.keys(pricing).forEach(zoneKey => {
        const total = seats[zoneKey] || 0
        const sold = soldByZone[zoneKey] || 0
        const remaining = total > 0 ? Math.max(0, total - sold) : 999999 // Unlimited if not set

        availability[zoneKey] = {
            label: pricingLabels[zoneKey] || zoneKey.toUpperCase(),
            price: pricing[zoneKey] || 0,
            total,
            sold,
            remaining,
            available: total === 0 || remaining > 0 // Available if unlimited or has remaining
        }
    })

    // Also check old columns if pricing is empty (backward compatibility)
    if (Object.keys(pricing).length === 0) {
        const oldZones = [
            { key: "vip", label: "VIP" },
            { key: "tribune", label: "Tribune" },
            { key: "pelouse", label: "Pelouse" }
        ]

        // Get old prices from event
        const { data: oldEvent } = await supabase
            .from("events")
            .select("price_vip, price_tribune, price_pelouse")
            .eq("id", id)
            .single()

        if (oldEvent) {
            oldZones.forEach(z => {
                const priceKey = `price_${z.key}` as keyof typeof oldEvent
                const sold = soldByZone[z.key] || soldByZone[z.key.toUpperCase()] || 0

                availability[z.key] = {
                    label: z.label,
                    price: (oldEvent[priceKey] as number) || 0,
                    total: 0, // Unknown
                    sold,
                    remaining: 999999, // Unlimited
                    available: true
                }
            })
        }
    }

    return NextResponse.json({
        eventId: event.id,
        status: event.status,
        availability
    })
}
