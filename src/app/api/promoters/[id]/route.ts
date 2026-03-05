import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// PATCH /api/promoters/[id] — approve or reject
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { status, admin_note } = await request.json()

        if (!["approved", "rejected"].includes(status)) {
            return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
        }

        const updateData: any = {
            status,
            admin_note: admin_note || null,
            updated_at: new Date().toISOString()
        }

        if (status === "approved") {
            updateData.approved_at = new Date().toISOString()
            updateData.approved_by = "Administrateur"
        }

        const { data, error } = await supabase
            .from("promoters")
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("[PROMOTERS PATCH]", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: `Compte ${status === "approved" ? "approuvé" : "rejeté"}`, promoter: data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// GET /api/promoters/[id] — get single promoter
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const { data, error } = await supabase
        .from("promoters")
        .select("*")
        .eq("id", id)
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json({ promoter: data })
}
