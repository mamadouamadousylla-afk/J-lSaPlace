import { NextRequest, NextResponse } from "next/server"

// WhatsApp Business API Configuration
// You need to set these in your .env.local file
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || ""
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || ""
const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0"

// Generate a 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via WhatsApp Business API
async function sendWhatsAppOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string }> {
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
        console.log("WhatsApp credentials not configured, using development mode")
        return { success: true } // Dev mode
    }

    try {
        // Format phone number (remove + and spaces)
        const formattedPhone = phoneNumber.replace(/[+\s]/g, "")
        
        const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: formattedPhone,
                type: "template",
                template: {
                    name: "hello_world", // Must match your template name in Meta Business
                    language: {
                        code: "en_us" // or "en" based on your template
                    },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    text: otp
                                }
                            ]
                        },
                        {
                            type: "button",
                            sub_type: "url",
                            index: 0,
                            parameters: [
                                {
                                    type: "text",
                                    text: otp
                                }
                            ]
                        }
                    ]
                }
            })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error("WhatsApp API error:", data)
            return { success: false, error: data.error?.message || "Erreur d'envoi WhatsApp" }
        }

        console.log("WhatsApp message sent:", data)
        return { success: true }
    } catch (error: any) {
        console.error("Error sending WhatsApp message:", error)
        return { success: false, error: error.message }
    }
}

// Store OTP temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>()

export async function POST(request: NextRequest) {
    try {
        const { phone, firstName, lastName } = await request.json()

        if (!phone) {
            return NextResponse.json({ error: "Numéro de téléphone requis" }, { status: 400 })
        }

        // Format phone number
        const formattedPhone = phone.startsWith("+") ? phone : `+221${phone}`

        // Generate OTP
        const otp = generateOTP()
        
        // Store OTP with 5-minute expiry
        otpStore.set(formattedPhone, {
            otp,
            expires: Date.now() + 5 * 60 * 1000
        })

        // Try to send via WhatsApp
        const result = await sendWhatsAppOTP(formattedPhone, otp)

        if (!result.success && !WHATSAPP_TOKEN) {
            // Development mode - WhatsApp not configured
            console.log(`[DEV MODE] OTP for ${formattedPhone}: ${otp}`)
            return NextResponse.json({
                success: true,
                message: "OTP envoyé via WhatsApp (mode développement)",
                dev_otp: otp, // Only show in development
                method: "whatsapp_dev"
            })
        }

        if (!result.success) {
            // WhatsApp failed, fallback to development mode
            console.log(`[FALLBACK] WhatsApp failed, OTP for ${formattedPhone}: ${otp}`)
            return NextResponse.json({
                success: true,
                message: "OTP envoyé (mode développement - WhatsApp non configuré)",
                dev_otp: otp,
                method: "fallback"
            })
        }

        return NextResponse.json({
            success: true,
            message: "OTP envoyé via WhatsApp",
            method: "whatsapp"
        })
    } catch (error: any) {
        console.error("Erreur:", error)
        return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 })
    }
}

// Verify OTP endpoint
export async function PUT(request: NextRequest) {
    try {
        const { phone, otp } = await request.json()

        if (!phone || !otp) {
            return NextResponse.json({ error: "Téléphone et code requis" }, { status: 400 })
        }

        const formattedPhone = phone.startsWith("+") ? phone : `+221${phone}`

        // Check stored OTP
        const stored = otpStore.get(formattedPhone)

        if (!stored) {
            return NextResponse.json({ error: "Code expiré ou non trouvé" }, { status: 400 })
        }

        if (Date.now() > stored.expires) {
            otpStore.delete(formattedPhone)
            return NextResponse.json({ error: "Code expiré" }, { status: 400 })
        }

        if (stored.otp !== otp) {
            return NextResponse.json({ error: "Code incorrect" }, { status: 400 })
        }

        // OTP is valid, remove it
        otpStore.delete(formattedPhone)

        return NextResponse.json({
            success: true,
            message: "Code vérifié avec succès"
        })
    } catch (error: any) {
        console.error("Erreur:", error)
        return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 })
    }
}
