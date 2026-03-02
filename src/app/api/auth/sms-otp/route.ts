import { NextRequest, NextResponse } from "next/server"
import twilio from "twilio"
import { generateOTP, storeOTP } from "@/lib/otp-store"

// Twilio Configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID || ""
const authToken = process.env.TWILIO_AUTH_TOKEN || ""
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || ""

export async function POST(request: NextRequest) {
    try {
        const { phone, firstName, lastName, password } = await request.json()

        if (!phone) {
            return NextResponse.json({ error: "Numéro de téléphone requis" }, { status: 400 })
        }

        // Format phone number for Twilio (E.164 format)
        let formattedPhone = phone.startsWith("+") ? phone : `+221${phone}`

        // Generate OTP
        const otp = generateOTP()
        
        // Store OTP with shared store (including password for signup)
        storeOTP(formattedPhone, otp, firstName, lastName, password)

        // Check if Twilio is configured
        if (!accountSid || !authToken || !twilioPhoneNumber) {
            console.log(`[DEV MODE] OTP for ${formattedPhone}: ${otp}`)
            return NextResponse.json({
                success: true,
                message: "OTP envoyé (mode développement)",
                dev_otp: otp,
                method: "twilio_dev"
            })
        }

        // Send SMS via Twilio
        const client = twilio(accountSid, authToken)

        const message = await client.messages.create({
            body: `Votre code de vérification SunuLamb est : ${otp}. Ce code expire dans 5 minutes.`,
            from: twilioPhoneNumber,
            to: formattedPhone
        })

        console.log("Twilio SMS sent:", message.sid)

        return NextResponse.json({
            success: true,
            message: "OTP envoyé via SMS",
            method: "twilio",
            sid: message.sid
        })
    } catch (error: any) {
        console.error("Erreur Twilio:", error)
        
        // Fallback to dev mode on error
        const { phone, firstName, lastName, password } = await request.json().catch(() => ({}))
        if (phone) {
            const formattedPhone = phone.startsWith("+") ? phone : `+221${phone}`
            const otp = generateOTP()
            storeOTP(formattedPhone, otp, firstName, lastName, password)
            
            return NextResponse.json({
                success: true,
                message: "OTP envoyé (mode développement)",
                dev_otp: otp,
                method: "fallback"
            })
        }
        
        return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 })
    }
}
