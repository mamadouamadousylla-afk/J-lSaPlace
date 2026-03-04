import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
)

// GET - Récupérer toutes les notifications
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get("limit") || "50")
        const unreadOnly = searchParams.get("unread") === "true"

        let query = supabase
            .from("admin_notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit)

        if (unreadOnly) {
            query = query.eq("is_read", false)
        }

        const { data, error } = await query

        if (error) throw error

        return NextResponse.json({ success: true, notifications: data })
    } catch (error: any) {
        console.error("[GET Notifications] Error:", error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

// POST - Créer une notification (optionnel, pour usage manuel)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, title, message, data } = body

        const { error } = await supabase.from("admin_notifications").insert({
            type,
            title,
            message,
            data
        })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[POST Notification] Error:", error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
