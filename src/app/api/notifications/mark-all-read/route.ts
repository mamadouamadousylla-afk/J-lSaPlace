import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
)

// POST - Marquer toutes les notifications comme lues
export async function POST() {
    try {
        const { error } = await supabase
            .from("admin_notifications")
            .update({ is_read: true })
            .eq("is_read", false)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[Mark All Read] Error:", error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
