"use client"

import { motion } from "framer-motion"
import { Zap, Music, Theater, Users, Mic2 } from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
    { id: "sport", label: "Sport", icon: Zap },
    { id: "musique", label: "Musique", icon: Music },
    { id: "humour", label: "Humour", icon: Theater },
    { id: "loisirs", label: "Loisirs", icon: Users },
    { id: "conference", label: "Conférence", icon: Mic2 },
]

interface CategoryFilterProps {
    selectedCategory: string
    onCategoryChange: (categoryId: string) => void
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
    return (
        <section className="px-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-poppins font-bold text-gray-900">Catégories</h2>
                <button
                    onClick={() => onCategoryChange("all")}
                    className="text-[#2D75B6] font-medium text-sm"
                >
                    Voir tout
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                {categories.map((cat) => {
                    const isActive = selectedCategory === cat.id
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className="flex flex-col items-center gap-3 min-w-[80px]"
                        >
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-colors duration-300",
                                    isActive
                                        ? "bg-[#2D75B6] text-white shadow-lg"
                                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                )}
                            >
                                <cat.icon className="w-8 h-8" />
                            </motion.div>
                            <span className={cn(
                                "text-sm",
                                isActive ? "font-medium text-gray-900" : "text-gray-500"
                            )}>
                                {cat.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}
