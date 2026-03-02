import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { qr_code } = await request.json();

        // Validation simple du QR code (simulée)
        if (!qr_code || typeof qr_code !== 'string') {
            return Response.json(
                { error: "Code QR invalide" },
                { status: 400 }
            );
        }

        // Ici, dans une vraie application, vous vérifieriez le QR code dans votre base de données
        // Pour cette simulation, nous allons juste retourner un résultat factice
        
        // Simulation d'une réponse réussie
        const isValid = Math.random() > 0.2; // 80% de chance que le ticket soit valide
        
        if (isValid) {
            // Dans une vraie application, vous mettriez à jour le statut du ticket en "used"
            // await supabase.from('tickets').update({ status: 'used' }).match({ qr_code });
            
            return Response.json({
                valid: true,
                message: "Ticket validé avec succès!",
                ticket: {
                    event: {
                        title: "Grand Combat de Lutte",
                    },
                    zone: "VIP",
                    quantity: 2,
                    user: {
                        full_name: "Amadou Ndiaye"
                    }
                }
            });
        } else {
            return Response.json({
                valid: false,
                message: "Ce ticket n'est pas valide ou a déjà été utilisé."
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Erreur lors de la validation du ticket:', error);
        return Response.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}