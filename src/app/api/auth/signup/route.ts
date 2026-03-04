import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use anon key for client-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
    try {
        const { phone, firstName, lastName } = await request.json()

        if (!phone) {
            return NextResponse.json({ error: "Numéro de téléphone requis" }, { status: 400 })
        }

        // Format phone number
        const formattedPhone = phone.startsWith("+") ? phone : `+221${phone}`

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Try to send OTP via Supabase Auth
        const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
            options: {
                data: {
                    first_name: firstName || "",
                    last_name: lastName || "",
                    full_name: firstName && lastName ? `${firstName} ${lastName}` : ""
                }
            }
        })

        if (error) {
            // Check if it's a configuration error (SMS provider not set up or unsupported country)
            if (
                error.message.includes("Invalid API key") || 
                error.message.includes("SMS") ||
                error.message.includes("Unsupported phone provider") ||
                error.message.includes("provider")
            ) {
                console.log("SMS provider not available, using development mode")
                // SMS provider not available
                return NextResponse.json({ error: "Service SMS temporairement indisponible" }, { status: 503 })
            }
            
            console.error("Erreur envoi OTP:", error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, message: "OTP envoyé" })
    } catch (error: any) {
        console.error("Erreur:", error)
        return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 })
    }
}
