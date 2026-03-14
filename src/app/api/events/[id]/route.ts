import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/events/[id] — Get a single event by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = createServerClient()
    const { id } = await params

    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !data) {
        return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ event: data })
}
