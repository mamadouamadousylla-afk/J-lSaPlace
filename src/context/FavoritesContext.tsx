"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"

interface FavoritesContextType {
    favorites: string[]
    toggleFavorite: (eventId: string) => void
    isFavorite: (eventId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    toggleFavorite: () => { },
    isFavorite: () => false,
})

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([])
    const [isInitialized, setIsInitialized] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("sunulamb_favorites")
        if (stored) {
            try {
                setFavorites(JSON.parse(stored))
            } catch (e) {
                console.error("Failed to parse favorites", e)
            }
        }
        setIsInitialized(true)
    }, [])

    // Save to localStorage on change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("sunulamb_favorites", JSON.stringify(favorites))
        }
    }, [favorites, isInitialized])

    const toggleFavorite = useCallback((eventId: string) => {
        setFavorites(prev =>
            prev.includes(eventId)
                ? prev.filter(id => id !== eventId)
                : [...prev, eventId]
        )
    }, [])

    const isFavorite = useCallback((eventId: string) => {
        return favorites.includes(eventId)
    }, [favorites])

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    )
}

export function useFavorites() {
    return useContext(FavoritesContext)
}
