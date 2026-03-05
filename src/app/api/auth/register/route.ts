import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Service role pour bypasser RLS sur le upsert
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST /api/auth/register — Inscription directe sans OTP
export async function POST(request: NextRequest) {
    try {
        const { phone, firstName, lastName, password } = await request.json()

        if (!phone || !password || !firstName || !lastName) {
            return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 })
        }

        const formattedPhone = phone.startsWith("+") ? phone : `+221${phone}`
        const fullName = `${firstName} ${lastName}`.trim()
        // Fake email basé sur le numéro de téléphone pour Supabase Auth
        const fakeEmail = `${formattedPhone.replace('+', '')}@sunulamb.local`

        // Vérifier si le numéro existe déjà dans public.users
        const { data: existing } = await supabaseAnon
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

        // Créer un vrai utilisateur dans auth.users via signUp
        const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
            email: fakeEmail,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    first_name: firstName,
                    last_name: lastName,
                    phone: formattedPhone
                }
            }
        })

        if (authError || !authData.user) {
            console.error("[REGISTER] Auth error:", authError)
            // Si l'email existe déjà dans auth, c'est un doublon
            if (authError?.message?.includes('already registered')) {
                return NextResponse.json({ error: "Ce numéro est déjà associé à un compte" }, { status: 409 })
            }
            return NextResponse.json(
                { error: authError?.message || "Erreur lors de la création du compte" },
                { status: 500 }
            )
        }

        const userId = authData.user.id

        // Mettre à jour public.users avec les données complètes
        // (le trigger handle_new_user a créé la ligne, on la complète)
        await supabaseAdmin
            .from("users")
            .upsert({
                id: userId,
                phone: formattedPhone,
                full_name: fullName,
                first_name: firstName,
                last_name: lastName,
                password: password,
                points: 0
            }, { onConflict: 'id' })

        // Récupérer les données utilisateur
        const { data: userRow } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("id", userId)
            .single()

        const user = userRow || {
            id: userId,
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            phone: formattedPhone,
            points: 0
        }

        return NextResponse.json({
            message: "Compte créé avec succès",
            user: {
                id: user.id,
                full_name: user.full_name,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                email: user.email,
                points: user.points || 0,
                avatar_url: user.avatar_url,
                created_at: user.created_at
            }
        })
    } catch (error: any) {
        console.error("[REGISTER] Exception:", error)
        return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 })
    }
}
