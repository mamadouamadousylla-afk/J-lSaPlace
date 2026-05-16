import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// POST /api/auth/reset-password — send reset link to email
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: "Email requis" }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Determine the redirect URL based on environment
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://j-l-sa-place.vercel.app"
        const redirectTo = `${siteUrl}/promoteur/reinitialiser-mot-de-passe`

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo
        })

        if (error) {
            console.error("[RESET PASSWORD]", error)
            // Don't reveal if email exists or not for security
            // Always return success to prevent email enumeration
        }

        return NextResponse.json({
            success: true,
            message: "Si cet email est enregistré, vous recevrez un lien de réinitialisation."
        })
    } catch (err: any) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
