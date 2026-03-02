"use client"

import AdminSidebar from "@/components/admin/AdminSidebar"
import { usePathname } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Safety check just in case, though this file only affects /admin
    if (!pathname.startsWith('/admin')) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Desktop Left Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8">
                <div className="font-sans antialiased max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
