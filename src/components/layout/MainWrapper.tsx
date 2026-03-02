"use client"

import { usePathname } from "next/navigation"

export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Don't constrain the width for admin pages
    if (pathname?.startsWith('/admin')) {
        return <>{children}</>
    }

    // Apply mobile-first styling for the consumer app
    return (
        <main className="max-w-lg mx-auto relative min-h-screen pb-20 bg-white">
            {children}
        </main>
    )
}
