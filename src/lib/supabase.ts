import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for use in the browser (client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client (uses service role if available, otherwise anon key for public reads)
export function createServerClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== "REMPLACER_PAR_SERVICE_ROLE_KEY"
            ? process.env.SUPABASE_SERVICE_ROLE_KEY
            : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    full_name: string | null
                    phone: string
                    email: string | null
                    avatar_url: string | null
                    points: number
                    rank: number | null
                    created_at: string
                }
            }
            events: {
                Row: {
                    id: string
                    title: string
                    date: string
                    time: string
                    month_label: string
                    category: string
                    category_id: string
                    price_vip: number
                    price_tribune: number
                    price_pelouse: number
                    location: string
                    address: string
                    image_url: string
                    description: string
                    tag: string
                    status: "published" | "cancelled" | "sold_out"
                    promoter: string | null
                    promoter_logo: string | null
                    promoter_description: string | null
                    latitude: number | null
                    longitude: number | null
                }
            }
            tickets: {
                Row: {
                    id: string
                    user_id: string
                    event_id: string
                    zone: string
                    quantity: number
                    total_price: number
                    qr_code: string
                    payment_ref: string | null
                    status: "pending" | "confirmed" | "used" | "cancelled"
                    created_at: string
                }
            }
            challenges: {
                Row: {
                    id: string
                    event_id: string
                    fighter_1: string
                    fighter_2: string
                    winner: string | null
                    points: number
                    deadline: string
                }
            }
            predictions: {
                Row: {
                    id: string
                    user_id: string
                    challenge_id: string
                    predicted_winner: string
                    is_correct: boolean | null
                    points_earned: number
                    created_at: string
                }
            }
            payments: {
                Row: {
                    id: string
                    transaction_id: string
                    user_id: string | null
                    event_id: string | null
                    ticket_id: string | null
                    amount: number
                    fee: number
                    net_amount: number
                    payment_method: 'wave' | 'orange' | 'free' | 'card'
                    status: 'pending' | 'completed' | 'failed' | 'refunded'
                    phone_number: string | null
                    payment_reference: string | null
                    metadata: any
                    created_at: string
                    updated_at: string
                }
            }
        }
    }
}
