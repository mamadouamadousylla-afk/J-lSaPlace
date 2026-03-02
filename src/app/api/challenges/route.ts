import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/challenges — List all active challenges
export async function GET(request: NextRequest) {
    const supabase = createServerClient()

    const { data, error } = await supabase
        .from("challenges")
        .select(`
            *,
            events (title, date, image_url)
        `)
        .order("deadline", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ challenges: data })
}
