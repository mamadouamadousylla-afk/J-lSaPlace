import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
    try {
        const { qr_code, promoter_id } = await req.json()

        if (!qr_code) {
            return NextResponse.json({ error: "QR code manquant" }, { status: 400 })
        }

        // Find the ticket
        const { data: ticket, error: fetchError } = await supabase
            .from("tickets")
            .select("*, events(id, title, date, location, promoter_id)")
            .eq("qr_code", qr_code)
            .single()

        if (fetchError || !ticket) {
            return NextResponse.json({ error: "Billet introuvable ou QR code invalide" }, { status: 404 })
        }

        // Verify this ticket belongs to an event of this promoter
        if (promoter_id && ticket.events?.promoter_id !== promoter_id) {
            return NextResponse.json({ error: "Ce billet n'appartient pas à vos événements" }, { status: 403 })
        }

        // Check status
        if (ticket.status === "used") {
            return NextResponse.json({
                error: "Billet déjà utilisé",
                ticket: {
                    id: ticket.id,
                    zone: ticket.zone,
                    status: ticket.status,
                    event: ticket.events,
                },
                already_used: true
            }, { status: 409 })
        }

        if (ticket.status === "cancelled") {
            return NextResponse.json({ error: "Billet annulé" }, { status: 400 })
        }

        if (ticket.status === "pending") {
            return NextResponse.json({ error: "Billet non confirmé (paiement en attente)" }, { status: 400 })
        }

        // Mark as used
        const { error: updateError } = await supabase
            .from("tickets")
            .update({ status: "used" })
            .eq("id", ticket.id)

        if (updateError) {
            return NextResponse.json({ error: "Erreur lors de la validation" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            ticket: {
                id: ticket.id,
                zone: ticket.zone,
                quantity: ticket.quantity,
                total_price: ticket.total_price,
                status: "used",
                event: ticket.events,
            }
        })

    } catch {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
