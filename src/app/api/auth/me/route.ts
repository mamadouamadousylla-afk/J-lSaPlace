import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/auth/me — Get connected user profile
export async function GET(request: NextRequest) {
    const supabase = createServerClient()
    const authorization = request.headers.get("authorization")

    if (!authorization) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const token = authorization.replace("Bearer ", "")

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
        return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }

    // Get the user profile from public.users
    const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

    if (error || !profile) {
        return NextResponse.json({ error: "Profil non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ user: profile })
}
