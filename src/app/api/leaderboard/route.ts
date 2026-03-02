import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/leaderboard — Global ranking by points
export async function GET(request: NextRequest) {
    const supabase = createServerClient()

    const { data, error } = await supabase
        .from("users")
        .select("id, full_name, points, rank, avatar_url")
        .order("points", { ascending: false })
        .limit(50)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ leaderboard: data })
}
