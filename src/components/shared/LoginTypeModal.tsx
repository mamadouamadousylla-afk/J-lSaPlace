"use client"

import { motion, AnimatePresence } from "framer-motion"
import { User, Building2 } from "lucide-react"

interface LoginTypeModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectStandard: () => void
    onSelectPromoter: () => void
}

export default function LoginTypeModal({ isOpen, onClose, onSelectStandard, onSelectPromoter }: LoginTypeModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 text-center">Se connecter</h2>
                            <p className="text-sm text-gray-500 text-center mt-1">Choisissez votre type de compte</p>
                        </div>

                        {/* Options */}
                        <div className="p-6 space-y-4">
                            {/* Compte Standard */}
                            <button
                                onClick={onSelectStandard}
                                className="w-full p-5 bg-gray-50 hover:bg-gray-100 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <User className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-gray-900">Compte Standard</h3>
                                    <p className="text-sm text-gray-500 mt-1">Accédez à vos billets et historique</p>
                                </div>
                            </button>

                            {/* Compte Partenaire */}
                            <button
                                onClick={onSelectPromoter}
                                className="w-full p-5 bg-orange-50 hover:bg-orange-100 rounded-2xl border-2 border-orange-100 hover:border-orange-200 transition-all flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                    <Building2 className="w-6 h-6 text-orange-500" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-gray-900">Compte Partenaire</h3>
                                    <p className="text-sm text-gray-500 mt-1">Gérez vos événements et ventes</p>
                                </div>
                            </button>
                        </div>

                        {/* Cancel Button */}
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={onClose}
                                className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
