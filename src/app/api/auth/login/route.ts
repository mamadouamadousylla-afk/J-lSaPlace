import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST /api/auth/login — Login with phone + password
export async function POST(request: NextRequest) {
    try {
        const { phone, password } = await request.json()

        if (!phone || !password) {
            return NextResponse.json({ error: "Téléphone et mot de passe requis" }, { status: 400 })
        }

        const formattedPhone = phone.startsWith("+") ? phone : `+221${phone}`

        // Find user by phone
        const { data: users, error } = await supabase
            .from("users")
            .select("*")
            .eq("phone", formattedPhone)
            .limit(1)

        if (error || !users || users.length === 0) {
            return NextResponse.json({ error: "Aucun compte trouvé avec ce numéro" }, { status: 401 })
        }

        const user = users[0]

        // Check if user is a promoter — block frontend login for promoters
        const { data: promoters } = await supabase
            .from("promoters")
            .select("id, status")
            .eq("user_id", user.id)
            .in("status", ["approved", "pending"])
            .limit(1)

        if (promoters && promoters.length > 0) {
            if (promoters[0].status === "approved") {
                return NextResponse.json({ error: "Compte Partenaire détecté. Veuillez vous connecter via l'espace Partenaire." }, { status: 403 })
            } else {
                return NextResponse.json({ error: "Votre demande de compte Partenaire est en attente d'approbation." }, { status: 403 })
            }
        }

        // Check password (plain comparison — in production use bcrypt)
        if (user.password !== password) {
            return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 })
        }

        return NextResponse.json({
            message: "Connexion réussie",
            user: {
                id: user.id,
                full_name: user.full_name,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                email: user.email,
                points: user.points,
                avatar_url: user.avatar_url,
                created_at: user.created_at
            }
        })
    } catch (error: any) {
        console.error("[LOGIN] Error:", error)
        return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 })
    }
}
