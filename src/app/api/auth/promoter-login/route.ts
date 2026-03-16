import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
    try {
        const { phone, password } = await request.json()

        if (!phone || !password) {
            return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
        }

        // Create Supabase client with service role key (server-side only)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Step 1: Authenticate user
        const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
            phone: `+221${phone}`,
            password: password
        })

        if (authError || !authData.user) {
            return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
        }

        // Step 2: Check promoter status
        const { data: promoters, error: promoterError } = await supabaseAdmin
            .from("promoters")
            .select("*")
            .eq("user_id", authData.user.id)
            .eq("status", "approved")
            .limit(1)

        if (promoterError) {
            return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 })
        }

        if (!promoters || promoters.length === 0) {
            // Check pending/rejected status
            const { data: pending } = await supabaseAdmin
                .from("promoters")
                .select("status")
                .eq("user_id", authData.user.id)
                .limit(1)

            if (pending && pending.length > 0) {
                if (pending[0].status === "pending") {
                    return NextResponse.json({ 
                        error: "pending",
                        message: "Votre compte partenaire est en cours de validation par l'administrateur."
                    }, { status: 403 })
                }
                if (pending[0].status === "rejected") {
                    return NextResponse.json({ 
                        error: "rejected",
                        message: "Votre demande de compte partenaire a été rejetée. Contactez l'administrateur."
                    }, { status: 403 })
                }
            }

            // Not a partner account
            return NextResponse.json({ 
                error: "not_partner",
                message: "Aucun compte partenaire approuvé trouvé.",
                redirect: "/mon-compte"
            }, { status: 403 })
        }

        // Step 3: Return success with promoter data
        const promoter = promoters[0]
        
        return NextResponse.json({
            success: true,
            user: authData.user,
            promoter: promoter
        })

    } catch (error: any) {
        console.error("[PROMOTER LOGIN] Error:", error)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
