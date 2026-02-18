"use client"

import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, MapPin, Info, ArrowLeft, Plus, Minus, ShieldCheck } from "lucide-react"
import { formatPrice, cn } from "@/lib/utils"
import { useState } from "react"

const categories = [
    { id: "vip", name: "VIP", price: 15000, color: "bg-yellow-400", seats: 50 },
    { id: "tribune", name: "Tribune", price: 5000, color: "bg-primary", seats: 200 },
    { id: "pelouse", name: "Pelouse", price: 2000, color: "bg-green-300", seats: 500 },
]

export default function EventDetail() {
    const params = useParams()
    const router = useRouter()
    const [selectedCategory, setSelectedCategory] = useState(categories[1])
    const [quantity, setQuantity] = useState(1)

    const handleBooking = () => {
        router.push(`/paiement/booking-123?qty=${quantity}&cat=${selectedCategory.id}`)
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Absolute Header */}
            <div className="absolute top-12 left-6 z-10">
                <button
                    onClick={() => router.back()}
                    className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Hero Image */}
            <div className="relative h-[40vh] w-full">
                <img
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"
                    alt="Combat"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="px-6 -mt-10 relative z-20 space-y-8 pb-32">
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 shadow-xl border border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                        Grand Combat Royal
                    </div>
                    <h1 className="text-3xl font-poppins font-bold leading-tight">Modou Lô vs Siteu</h1>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-gray-500">
                            <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Dimanche, 24 Novembre</p>
                                <p className="text-xs">16h00 - 20h00</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                            <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Arène Nationale de Lutte</p>
                                <p className="text-xs">Pikine, Dakar</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Head to Head */}
                <section className="space-y-4">
                    <h2 className="text-xl font-poppins font-bold px-2">Les Adversaires</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { name: "Modou Lô", wins: 22, height: "1m85" },
                            { name: "Siteu", wins: 15, height: "1m80" }
                        ].map((l, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 text-center space-y-2">
                                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto" />
                                <p className="font-bold">{l.name}</p>
                                <div className="flex justify-center gap-4 text-[10px] font-medium text-gray-400">
                                    <span>{l.wins} Victoires</span>
                                    <span>{l.height}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Categories */}
                <section className="space-y-4">
                    <h2 className="text-xl font-poppins font-bold px-2">Choisir vos places</h2>
                    <div className="space-y-3">
                        {categories.map((cat) => (
                            <label
                                key={cat.id}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-3xl border-2 transition-all cursor-pointer",
                                    selectedCategory.id === cat.id
                                        ? "border-primary bg-primary/5"
                                        : "border-gray-100 dark:border-gray-800"
                                )}
                            >
                                <input
                                    type="radio"
                                    name="category"
                                    className="hidden"
                                    onChange={() => setSelectedCategory(cat)}
                                    checked={selectedCategory.id === cat.id}
                                />
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold", cat.color)}>
                                        {cat.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{cat.name}</h3>
                                        <p className="text-xs text-gray-400">{cat.seats} places disponibles</p>
                                    </div>
                                </div>
                                <p className="font-poppins font-bold text-lg">{formatPrice(cat.price)}</p>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Quantity */}
                <section className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
                    <div className="space-y-1">
                        <h3 className="font-bold text-sm">Quantité</h3>
                        <p className="text-xs text-gray-400">Max 5 tickets</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center text-primary border border-gray-100"
                        >
                            <Minus className="w-5 h-5" />
                        </button>
                        <span className="text-xl font-bold font-poppins">{quantity}</span>
                        <button
                            onClick={() => setQuantity(Math.min(5, quantity + 1))}
                            className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center text-primary border border-gray-100"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </section>
            </div>

            {/* Floating Action Buffer */}
            <div className="fixed bottom-24 inset-x-6 z-50">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBooking}
                    className="button-gnudem w-full bg-secondary text-secondary-foreground py-5 text-xl font-bold flex items-center justify-center gap-3 shadow-2xl"
                >
                    <ShieldCheck className="w-6 h-6" />
                    Réserver ({formatPrice(selectedCategory.price * quantity)})
                </motion.button>
            </div>
        </div>
    )
}
