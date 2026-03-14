import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/promoters — list all promoters (admin)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // pending | approved | rejected | all

    let query = supabase
        .from("promoters")
        .select("*")
        .order("created_at", { ascending: false })

    if (status && status !== "all") {
        query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
        console.error("[PROMOTERS GET]", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ promoters: data || [] })
}

// POST /api/promoters — submit promoter registration request
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { user_id, company_name, contact_name, phone, email, description, website } = body

        if (!company_name || !contact_name || !phone) {
            return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })
        }

        // Check if already submitted
        if (user_id) {
            const { data: existing } = await supabase
                .from("promoters")
                .select("id, status")
                .eq("user_id", user_id)
                .limit(1)

            if (existing && existing.length > 0) {
                const ex = existing[0]
                if (ex.status === "pending") {
                    return NextResponse.json({ error: "Votre demande est déjà en cours de traitement" }, { status: 409 })
                }
                if (ex.status === "approved") {
                    return NextResponse.json({ error: "Votre compte partenaire est déjà approuvé" }, { status: 409 })
                }
            }
        }

        const { data: promoter, error } = await supabase
            .from("promoters")
            .insert({
                user_id: user_id || null,
                company_name,
                contact_name,
                phone,
                email: email || null,
                description: description || null,
                website: website || null,
                status: "pending"
            })
            .select()
            .single()

        if (error) {
            console.error("[PROMOTERS POST]", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: "Demande envoyée avec succès", promoter })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
