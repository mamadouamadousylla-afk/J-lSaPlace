"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Settings } from "lucide-react"

export default function GlobalSettingsPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("general")
    const [siteName, setSiteName] = useState("SunuLamb")
    const [platformEmail, setPlatformEmail] = useState("contact@sunulamb.com")
    const [currency, setCurrency] = useState("West African CFA franc (XOF)")
    const [symbolPosition, setSymbolPosition] = useState("after")
    const [transactionFee, setTransactionFee] = useState("2.5")
    const [autoPayouts, setAutoPayouts] = useState(true)

    const handleSave = () => {
        // Simulate saving settings
        alert("Paramètres sauvegardés avec succès!")
    }

    const handleReset = () => {
        if (confirm("Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?")) {
            setSiteName("SunuLamb")
            setPlatformEmail("contact@sunulamb.com")
            setCurrency("West African CFA franc (XOF)")
            setSymbolPosition("after")
            setTransactionFee("2.5")
            setAutoPayouts(true)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-green-700">Paramètres Globaux du Système</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="h-8 w-8 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold">AD</div>
                    <span className="text-sm font-medium text-gray-700">Admin User</span>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="w-64 bg-green-700 text-white flex-shrink-0 flex flex-col hidden lg:flex">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold tracking-tight">SunuLamb Admin</h1>
                    </div>
                    <nav className="flex-1 px-4 space-y-1">
                        <a className="flex items-center px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg transition-colors" href="#">
                            <Settings className="w-5 h-5 mr-3" />
                            Dashboard
                        </a>
                        <a className="flex items-center px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg transition-colors" href="#">
                            <Settings className="w-5 h-5 mr-3" />
                            Gestion des Événements
                        </a>
                        <a className="flex items-center px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg transition-colors" href="#">
                            <Settings className="w-5 h-5 mr-3" />
                            Billets
                        </a>
                        <a className="flex items-center px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg transition-colors" href="#">
                            <Settings className="w-5 h-5 mr-3" />
                            Utilisateurs
                        </a>
                        <a className="flex items-center px-4 py-3 bg-white/20 text-white rounded-lg transition-colors font-medium" href="#">
                            <Settings className="w-5 h-5 mr-3" />
                            Paramètres
                        </a>
                    </nav>
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">AD</div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">Admin User</p>
                                <p className="text-xs text-white/60">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
                    <div className="p-8 max-w-5xl mx-auto w-full">
                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-8">
                            <nav className="flex space-x-8">
                                <button 
                                    onClick={() => setActiveTab("general")}
                                    className={`pb-4 px-1 text-sm font-medium transition-colors ${
                                        activeTab === "general" 
                                            ? "border-b-2 border-green-700 text-green-700" 
                                            : "text-gray-500 hover:text-green-700"
                                    }`}
                                >
                                    Paramètres Généraux
                                </button>
                                <button 
                                    onClick={() => setActiveTab("payments")}
                                    className={`pb-4 px-1 text-sm font-medium transition-colors ${
                                        activeTab === "payments" 
                                            ? "border-b-2 border-green-700 text-green-700" 
                                            : "text-gray-500 hover:text-green-700"
                                    }`}
                                >
                                    Passerelles de Paiement
                                </button>
                                <button 
                                    onClick={() => setActiveTab("security")}
                                    className={`pb-4 px-1 text-sm font-medium transition-colors ${
                                        activeTab === "security" 
                                            ? "border-b-2 border-green-700 text-green-700" 
                                            : "text-gray-500 hover:text-green-700"
                                    }`}
                                >
                                    Sécurité & Accès
                                </button>
                                <button 
                                    onClick={() => setActiveTab("localization")}
                                    className={`pb-4 px-1 text-sm font-medium transition-colors ${
                                        activeTab === "localization" 
                                            ? "border-b-2 border-green-700 text-green-700" 
                                            : "text-gray-500 hover:text-green-700"
                                    }`}
                                >
                                    Localisation
                                </button>
                            </nav>
                        </div>

                        <div className="space-y-8">
                            {/* Site Identity Section */}
                            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                    <h3 className="text-base font-semibold">Identité du Site</h3>
                                    <p className="text-sm text-gray-500">Gérez les informations publiques de votre plateforme.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Nom du Site</label>
                                            <input 
                                                className="w-full rounded-lg border-gray-300 focus:ring-green-700 focus:border-green-700 text-sm"
                                                type="text" 
                                                value={siteName}
                                                onChange={(e) => setSiteName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Email de la Plateforme</label>
                                            <input 
                                                className="w-full rounded-lg border-gray-300 focus:ring-green-700 focus:border-green-700 text-sm"
                                                type="email" 
                                                value={platformEmail}
                                                onChange={(e) => setPlatformEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Logo de la Plateforme</label>
                                        <div className="flex items-center space-x-6">
                                            <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                                <Settings className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex space-x-2">
                                                    <button className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors">
                                                        Télécharger Nouveau
                                                    </button>
                                                    <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                                        Supprimer
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-400">Taille recommandée : 512x512px. PNG ou SVG.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Financial Configuration Section */}
                            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                    <h3 className="text-base font-semibold">Configuration Financière</h3>
                                    <p className="text-sm text-gray-500">Définir la devise par défaut et les règles de taxation.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Devise par Défaut</label>
                                            <select 
                                                className="w-full rounded-lg border-gray-300 focus:ring-green-700 focus:border-green-700 text-sm"
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value)}
                                            >
                                                <option>West African CFA franc (XOF)</option>
                                                <option>US Dollar (USD)</option>
                                                <option>Euro (EUR)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Position du Symbole</label>
                                            <div className="flex space-x-4 mt-2">
                                                <label className="inline-flex items-center">
                                                    <input 
                                                        checked={symbolPosition === "after"}
                                                        onChange={() => setSymbolPosition("after")}
                                                        className="text-green-700 focus:ring-green-700" 
                                                        name="symbol-pos" 
                                                        type="radio"
                                                    />
                                                    <span className="ml-2 text-sm">Après le Montant (100 FCFA)</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <input 
                                                        checked={symbolPosition === "before"}
                                                        onChange={() => setSymbolPosition("before")}
                                                        className="text-green-700 focus:ring-green-700" 
                                                        name="symbol-pos" 
                                                        type="radio"
                                                    />
                                                    <span className="ml-2 text-sm">Avant le Montant (FCFA 100)</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Frais de Transaction (%)</label>
                                            <div className="relative">
                                                <input 
                                                    className="w-full rounded-lg border-gray-300 focus:ring-green-700 focus:border-green-700 text-sm pr-8"
                                                    type="number" 
                                                    value={transactionFee}
                                                    onChange={(e) => setTransactionFee(e.target.value)}
                                                />
                                                <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 pt-6">
                                            <input 
                                                checked={autoPayouts}
                                                onChange={(e) => setAutoPayouts(e.target.checked)}
                                                className="rounded text-green-700 focus:ring-green-700 h-4 w-4" 
                                                type="checkbox"
                                            />
                                            <label className="text-sm text-gray-700">
                                                Activer les paiements automatiques aux promoteurs
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Integrations Section */}
                            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-base font-semibold">Intégrations</h3>
                                        <p className="text-sm text-gray-500">Clés de service tiers et webhooks.</p>
                                    </div>
                                    <button className="text-green-700 text-sm font-semibold hover:underline">
                                        Ajouter un Nouveau Service
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                                                <Settings className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">API Orange Money</p>
                                                <p className="text-xs text-gray-500">Dernière synchronisation : il y a 2 heures</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded">
                                                Connecté
                                            </span>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Settings className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                                                <Settings className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Wave Sénégal</p>
                                                <p className="text-xs text-gray-500">Nécessite une mise à jour des identifiants</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded">
                                                Configuration Requise
                                            </span>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Settings className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-4 pt-4">
                                <button 
                                    onClick={handleReset}
                                    className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
                                >
                                    Réinitialiser
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-8 py-2.5 rounded-lg text-sm font-semibold bg-green-700 text-white hover:bg-green-800 shadow-lg transition-all"
                                >
                                    Sauvegarder les Modifications
                                </button>
                            </div>
                        </div>
                    </div>

                    <footer className="mt-auto p-8 border-t border-gray-200 text-center text-xs text-gray-400">
                        © 2024 SunuLamb System v2.4.0. Tous Droits Réservés.
                    </footer>
                </main>
            </div>

            {/* Floating Help Button */}
            <div className="fixed bottom-8 right-8">
                <button className="h-14 w-14 bg-white border border-gray-200 rounded-xl shadow-2xl flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}