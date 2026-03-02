import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// POST /api/predictions — Submit a prediction for a challenge
export async function POST(request: NextRequest) {
    const supabase = createServerClient()
    const authorization = request.headers.get("authorization")

    if (!authorization) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const token = authorization.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
        return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }

    const { challenge_id, predicted_winner } = await request.json()

    if (!challenge_id || !predicted_winner) {
        return NextResponse.json({ error: "challenge_id et predicted_winner sont requis" }, { status: 400 })
    }

    // Check challenge deadline not passed
    const { data: challenge } = await supabase
        .from("challenges")
        .select("deadline, fighter_1, fighter_2")
        .eq("id", challenge_id)
        .single()

    if (!challenge) {
        return NextResponse.json({ error: "Défi non trouvé" }, { status: 404 })
    }

    if (challenge.deadline && new Date(challenge.deadline) < new Date()) {
        return NextResponse.json({ error: "La deadline de ce défi est passée" }, { status: 400 })
    }

    if (predicted_winner !== challenge.fighter_1 && predicted_winner !== challenge.fighter_2) {
        return NextResponse.json({ error: "Ce lutteur ne participe pas à ce défi" }, { status: 400 })
    }

    const { data: prediction, error } = await supabase
        .from("predictions")
        .insert({
            user_id: user.id,
            challenge_id,
            predicted_winner
        })
        .select()
        .single()

    if (error) {
        // Unique constraint violation = already predicted
        if (error.code === "23505") {
            return NextResponse.json({ error: "Tu as déjà soumis un pronostic pour ce défi" }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ prediction }, { status: 201 })
}
