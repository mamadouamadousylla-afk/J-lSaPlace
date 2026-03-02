import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/tickets/me — Get connected user's tickets
export async function GET(request: NextRequest) {
    const supabase = createServerClient()
    const authorization = request.headers.get("authorization")

    if (!authorization) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const token = authorization.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
        return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }

    const { data: tickets, error } = await supabase
        .from("tickets")
        .select(`
            *,
            events (
                id,
                title,
                date,
                time,
                location,
                image_url,
                category,
                tag
            )
        `)
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .order("created_at", { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tickets })
}
