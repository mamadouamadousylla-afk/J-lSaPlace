"use client"

import { useState } from "react"
import { Search, Bell, Activity, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface HeaderProps {
    onSearch?: (query: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
    const [isSearching, setIsSearching] = useState(false)
    const [query, setQuery] = useState("")

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)
        if (onSearch) onSearch(value)
    }

    return (
        <header className="px-6 py-4 flex items-center justify-between bg-transparent sticky top-0 z-30 backdrop-blur-sm">
            <AnimatePresence mode="wait">
                {!isSearching ? (
                    <motion.div
                        key="logo"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center h-8"
                    >
                        <img
                            src="/logo-sunulamb.png"
                            alt="SunuLamb"
                            className="h-full w-auto object-contain"
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="search-input"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "100%" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex-1 flex items-center gap-2 bg-gray-100/80 rounded-2xl px-4 py-2 mr-4"
                    >
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Rechercher un événement..."
                            value={query}
                            onChange={handleSearch}
                            className="bg-transparent border-none outline-none text-sm w-full text-gray-800 placeholder:text-gray-400"
                        />
                        <button onClick={() => {
                            setIsSearching(false)
                            setQuery("")
                            if (onSearch) onSearch("")
                        }}>
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-2 text-gray-600">
                {!isSearching && (
                    <button
                        onClick={() => setIsSearching(true)}
                        className="p-2.5 hover:bg-gray-100 rounded-full transition-all active:scale-90"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                )}
                <button className="p-2.5 hover:bg-gray-100 rounded-full transition-all relative active:scale-90">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FF4B4B] rounded-full border border-white" />
                </button>
            </div>
        </header>
    )
}
