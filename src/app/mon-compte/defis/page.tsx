"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Trophy, CheckCircle2, ChevronRight, Swords, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const challenges = [
    {
        id: "1",
        title: "Modou Lô vs Sa Thiès",
        fighters: ["Modou Lô", "Sa Thiès"],
        date: "5 Avr 2025",
        points: 500,
        imageUrl: "/hero-combat.png"
    },
    {
        id: "2",
        title: "Eumeu Sène vs Ada Fass",
        fighters: ["Eumeu Sène", "Ada Fass"],
        date: "19 Avr 2026",
        points: 300,
        imageUrl: "/eumeu-ada.jpg"
    },
    {
        id: "3",
        title: "Reug Reug vs Bombardier",
        fighters: ["Reug Reug", "Bombardier"],
        date: "4 Jan 2025",
        points: 250,
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600"
    }
]

export default function DefisPage() {
    const router = useRouter()
    const [predictions, setPredictions] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState<string[]>([])

    const handleSelectWinner = (challengeId: string, fighter: string) => {
        if (submitted.includes(challengeId)) return
        setPredictions(prev => ({ ...prev, [challengeId]: fighter }))
    }

    const handleSubmit = (challengeId: string) => {
        if (!predictions[challengeId]) return
        setSubmitted(prev => [...prev, challengeId])
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 p-6 pt-16 pb-32 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-3 rounded-full bg-white/10 text-white"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-poppins font-bold text-white">Mes Défis</h1>
                    <p className="text-white/50 text-xs">Pronostiquez et gagnez des points</p>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-primary to-green-900 rounded-[2.5rem] p-6 text-white flex justify-between items-center shadow-xl border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase opacity-60">Points Accumulés</p>
                        <p className="text-2xl font-poppins font-bold">1,250</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase opacity-60">Classement</p>
                    <p className="text-xl font-poppins font-bold">#42</p>
                </div>
            </div>

            {/* Challenges List */}
            <div className="space-y-6">
                <h2 className="text-lg font-poppins font-bold text-white px-2">Combats à venir</h2>

                {challenges.map((challenge, idx) => {
                    const isSubmitted = submitted.includes(challenge.id)
                    const selectedWinner = predictions[challenge.id]

                    return (
                        <motion.div
                            key={challenge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-lg"
                        >
                            {/* Card Header with Image */}
                            <div className="h-32 w-full relative">
                                <img src={challenge.imageUrl} className="w-full h-full object-cover object-top opacity-50" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                                <div className="absolute top-4 left-6">
                                    <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold uppercase backdrop-blur-md border border-secondary/30">
                                        +{challenge.points} Points
                                    </span>
                                </div>
                                <div className="absolute bottom-2 left-6 right-6 flex justify-between items-end">
                                    <h3 className="font-bold text-lg text-white">{challenge.title}</h3>
                                    <p className="text-[10px] text-white/50 mb-1">{challenge.date}</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between gap-4">
                                    {challenge.fighters.map((fighter, i) => (
                                        <button
                                            key={fighter}
                                            onClick={() => handleSelectWinner(challenge.id, fighter)}
                                            disabled={isSubmitted}
                                            className={cn(
                                                "flex-1 p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2",
                                                selectedWinner === fighter
                                                    ? "border-primary bg-primary/10"
                                                    : "border-white/5 bg-white/5",
                                                isSubmitted && selectedWinner !== fighter && "opacity-50 grayscale"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                                                selectedWinner === fighter ? "bg-primary text-white" : "bg-white/10 text-white/50"
                                            )}>
                                                {fighter[0]}
                                            </div>
                                            <span className={cn(
                                                "text-xs font-bold",
                                                selectedWinner === fighter ? "text-primary" : "text-white/70"
                                            )}>{fighter}</span>
                                        </button>
                                    ))}
                                    <div className="absolute left-1/2 -translate-x-1/2 mt-[-40px]">
                                        <div className="bg-slate-950 p-2 rounded-full border border-white/10">
                                            <Swords className="w-4 h-4 text-white/20" />
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {!isSubmitted ? (
                                        <motion.button
                                            key="submit"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => handleSubmit(challenge.id)}
                                            disabled={!selectedWinner}
                                            className={cn(
                                                "w-full py-4 rounded-full font-bold text-sm transition-all",
                                                selectedWinner
                                                    ? "bg-secondary text-secondary-foreground shadow-lg"
                                                    : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                                            )}
                                        >
                                            Valider mon pronostic
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            key="success"
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="w-full py-4 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center gap-2 text-primary font-bold text-sm"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            Pronostic enregistré !
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Motivation Section */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] space-y-4">
                <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <h4 className="font-bold text-white">Le savais-tu ?</h4>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">
                    Les pronostics corrects te font grimper dans le classement mondial de SunuLamb. Les 10 premiers chaque mois reçoivent des tickets VIP gratuits !
                </p>
                <button className="text-primary text-xs font-bold underline">Voir le règlement</button>
            </div>
        </div>
    )
}
