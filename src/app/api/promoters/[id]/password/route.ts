import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/promoters/[id]/password — get current password of the promoter's user
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Get promoter with user info
    const { data: promoter, error: pErr } = await supabase
        .from("promoters")
        .select("*, user_id")
        .eq("id", id)
        .single()

    if (pErr || !promoter) {
        return NextResponse.json({ error: "Partenaire introuvable" }, { status: 404 })
    }

    if (!promoter.user_id) {
        return NextResponse.json({ error: "Ce partenaire n'a pas de compte utilisateur lié" }, { status: 404 })
    }

    // Get the password from users table
    const { data: user, error: uErr } = await supabase
        .from("users")
        .select("password, phone, email")
        .eq("id", promoter.user_id)
        .single()

    if (uErr || !user) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
    }

    return NextResponse.json({
        password: user.password || null,
        phone: user.phone,
        email: user.email
    })
}

// POST /api/promoters/[id]/password — reset password for the promoter's user
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Get promoter
    const { data: promoter, error: pErr } = await supabase
        .from("promoters")
        .select("user_id, phone")
        .eq("id", id)
        .single()

    if (pErr || !promoter) {
        return NextResponse.json({ error: "Partenaire introuvable" }, { status: 404 })
    }

    if (!promoter.user_id) {
        return NextResponse.json({ error: "Ce partenaire n'a pas de compte utilisateur lié" }, { status: 404 })
    }

    // Generate a new temporary password (6 digits)
    const newPassword = Math.floor(100000 + Math.random() * 900000).toString()

    // Update password in users table
    const { error: uErr } = await supabase
        .from("users")
        .update({ password: newPassword })
        .eq("id", promoter.user_id)

    if (uErr) {
        return NextResponse.json({ error: uErr.message }, { status: 500 })
    }

    return NextResponse.json({ newPassword })
}
