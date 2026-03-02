import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// POST /api/auth/send-otp — Send OTP via SMS (Supabase Auth)
export async function POST(request: NextRequest) {
    const { phone } = await request.json()

    if (!phone) {
        return NextResponse.json({ error: "Numéro de téléphone requis" }, { status: 400 })
    }

    // Format international: +221XXXXXXXXX
    const formattedPhone = phone.startsWith("+") ? phone : `+221${phone}`

    const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
    })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "OTP envoyé avec succès", phone: formattedPhone })
}
