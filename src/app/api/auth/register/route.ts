import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST /api/auth/register — Inscription directe sans OTP
export async function POST(request: NextRequest) {
    try {
        const { phone, firstName, lastName, password } = await request.json()

        if (!phone || !password || !firstName || !lastName) {
            return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
        }

        const formattedPhone = phone.startsWith("+") ? phone : `+221${phone}`

        // Vérifier si le numéro existe déjà
        const { data: existing } = await supabase
            .from("users")
            .select("id")
            .eq("phone", formattedPhone)
            .limit(1)

        if (existing && existing.length > 0) {
            return NextResponse.json(
                { error: "Ce numéro de téléphone est déjà utilisé" },
                { status: 409 }
            )
        }

        const fullName = `${firstName} ${lastName}`.trim()

        // Créer le compte directement
        const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({
                id: crypto.randomUUID(),
                phone: formattedPhone,
                full_name: fullName,
                first_name: firstName,
                last_name: lastName,
                password: password,
                points: 0
            })
            .select()
            .single()

        if (createError) {
            console.error("[REGISTER] Error:", createError)
            return NextResponse.json(
                { error: "Erreur lors de la création du compte" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "Compte créé avec succès",
            user: {
                id: newUser.id,
                full_name: newUser.full_name,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                phone: newUser.phone,
                email: newUser.email,
                points: newUser.points,
                avatar_url: newUser.avatar_url,
                created_at: newUser.created_at
            }
        })
    } catch (error: any) {
        console.error("[REGISTER] Exception:", error)
        return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 })
    }
}
