import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/events — List all published events with optional filtering
export async function GET(request: NextRequest) {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let query = supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: true })

    if (category && category !== "all") {
        query = query.eq("category_id", category)
    }

    if (search) {
        query = query.or(
            `title.ilike.%${search}%,location.ilike.%${search}%,category.ilike.%${search}%`
        )
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ events: data })
}
