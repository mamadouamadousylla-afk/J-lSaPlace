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

        if (password.length < 6) {
            return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 })
        }

        const formattedPhone = phone.startsWith("+") ? phone : `+221${phone}`
        const fullName = `${firstName} ${lastName}`.trim()
        const fakeEmail = `${formattedPhone.replace('+', '')}@sunulamb.local`

        // Vérifier si le numéro existe déjà
        const { data: existingByPhone } = await supabase
            .from("users")
            .select("id")
            .eq("phone", formattedPhone)
            .limit(1)

        if (existingByPhone && existingByPhone.length > 0) {
            return NextResponse.json(
                { error: "Ce numéro de téléphone est déjà utilisé" },
                { status: 409 }
            )
        }

        // Essayer de créer avec l'API Admin (bypass email confirmation)
        // Note: Cela nécessite une edge function ou une configuration spéciale
        // Fallback: utiliser signUp et confirmer automatiquement
        
        // Créer l'utilisateur dans auth.users
        const { data: authData, error: authError } = await supabase.auth.signUp({
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

        if (authError) {
            console.error("[REGISTER] Auth error:", authError)
            if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
                return NextResponse.json({ error: "Ce numéro est déjà associé à un compte" }, { status: 409 })
            }
            return NextResponse.json(
                { error: authError.message || "Erreur lors de la création du compte" },
                { status: 500 }
            )
        }

        if (!authData.user) {
            return NextResponse.json({ error: "Erreur lors de la création du compte" }, { status: 500 })
        }

        const userId = authData.user.id

        // Attendre que le trigger handle_new_user crée la ligne
        await new Promise(resolve => setTimeout(resolve, 500))

        // Vérifier si l'utilisateur existe déjà dans public.users (créé par le trigger)
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("id", userId)
            .limit(1)

        if (existingUser && existingUser.length > 0) {
            // Mettre à jour les données
            await supabase
                .from("users")
                .update({
                    phone: formattedPhone,
                    full_name: fullName,
                    first_name: firstName,
                    last_name: lastName,
                    password: password,
                    points: 0
                })
                .eq("id", userId)
        } else {
            // Insérer directement
            await supabase
                .from("users")
                .insert({
                    id: userId,
                    phone: formattedPhone,
                    full_name: fullName,
                    first_name: firstName,
                    last_name: lastName,
                    password: password,
                    points: 0
                })
        }

        // Récupérer les données finales
        const { data: userRow, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single()

        if (fetchError) {
            console.error("[REGISTER] Fetch error:", fetchError)
        }

        const user = userRow || {
            id: userId,
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            phone: formattedPhone,
            points: 0,
            created_at: new Date().toISOString()
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
