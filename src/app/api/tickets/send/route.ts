import { NextResponse } from "next/server"
import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID || ""
const authToken = process.env.TWILIO_AUTH_TOKEN || ""
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || ""

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { ticket, phone, channel } = body

        if (!ticket || !phone || channel !== 'whatsapp') {
            return NextResponse.json({ success: false, error: "Paramètres invalides" }, { status: 400 })
        }

        // Format phone number for Twilio WhatsApp (E.164 format with whatsapp: prefix)
        let formattedPhone = phone.trim().replace(/\s+/g, '')
        if (!formattedPhone.startsWith("+")) {
            formattedPhone = `+221${formattedPhone}` // Default to Senegal code if none provided
        }
        
        const to = `whatsapp:${formattedPhone}`
        const from = twilioPhoneNumber.startsWith('whatsapp:') ? twilioPhoneNumber : `whatsapp:${twilioPhoneNumber}`

        const client = twilio(accountSid, authToken)
        
        // Construction du message WhatsApp
        const messageText = `🎟 *Billet Jël Sa Place*\n\n` +
            `Événement: *${ticket.title}*\n` +
            `Date: ${ticket.date} à ${ticket.time}\n` +
            `Lieu: ${ticket.location}\n` +
            `Zone: ${ticket.zone}\n` +
            (ticket.row ? `Rangée: ${ticket.row}\n` : '') +
            (ticket.seat ? `Place: ${ticket.seat}\n` : '') +
            `\nTicket ID: ${ticket.id}\n\n` +
            `Présentez ce message à l'entrée de l'événement.\nMerci pour votre achat sur Jël Sa Place !`

        const message = await client.messages.create({
            body: messageText,
            from: from,
            to: to,
        })

        console.log("Twilio WhatsApp ticket sent:", message.sid)

        return NextResponse.json({ success: true, messageId: message.sid })
    } catch (error: any) {
        console.error("Erreur d'envoi WhatsApp:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
