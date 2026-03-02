"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode"
import { X, Camera, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface QRScannerProps {
    isOpen: boolean
    onClose: () => void
    onScanSuccess: (result: any) => void
}

export default function QRScanner({ isOpen, onClose, onScanSuccess }: QRScannerProps) {
    const [scanResult, setScanResult] = useState<any>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)
    const containerId = "qr-reader"

    useEffect(() => {
        if (isOpen && !scannerRef.current) {
            // Petit délai pour laisser le DOM se mettre à jour
            setTimeout(() => {
                initScanner()
            }, 100)
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => {})
                scannerRef.current = null
            }
        }
    }, [isOpen])

    async function initScanner() {
        setIsScanning(true)
        setError(null)

        try {
            scannerRef.current = new Html5QrcodeScanner(
                containerId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [
                        Html5QrcodeScanType.SCAN_TYPE_CAMERA
                    ],
                },
                false
            )

            await scannerRef.current.render(
                async (decodedText) => {
                    // Succès du scan
                    await verifyTicket(decodedText)
                },
                (errorMessage) => {
                    // Ignorer les erreurs de scan continues
                }
            )
        } catch (err) {
            console.error("Erreur initialisation scanner:", err)
            setError("Impossible d'accéder à la caméra. Vérifiez les permissions.")
        }
        
        setIsScanning(false)
    }

    async function verifyTicket(qrCode: string) {
        setScanResult({ loading: true, qrCode })

        try {
            // Rechercher le ticket par QR code ou ID
            const { data: ticket, error } = await supabase
                .from("tickets")
                .select(`
                    id,
                    zone,
                    quantity,
                    total_price,
                    status,
                    created_at,
                    events ( id, title, date, location ),
                    users ( full_name, phone )
                `)
                .or(`id.eq.${qrCode},qr_code.eq.${qrCode}`)
                .single()

            if (error || !ticket) {
                setScanResult({
                    loading: false,
                    success: false,
                    message: "Ticket non trouvé",
                    qrCode
                })
                return
            }

            if (ticket.status === "used") {
                setScanResult({
                    loading: false,
                    success: false,
                    message: "Ce ticket a déjà été utilisé",
                    ticket,
                    qrCode
                })
                return
            }

            if (ticket.status === "cancelled") {
                setScanResult({
                    loading: false,
                    success: false,
                    message: "Ce ticket a été annulé",
                    ticket,
                    qrCode
                })
                return
            }

            // Marquer comme utilisé
            if (ticket.status === "confirmed") {
                const { error: updateError } = await supabase
                    .from("tickets")
                    .update({ status: "used" })
                    .eq("id", ticket.id)

                if (updateError) {
                    setScanResult({
                        loading: false,
                        success: false,
                        message: "Erreur lors de la validation",
                        ticket,
                        qrCode
                    })
                    return
                }
            }

            setScanResult({
                loading: false,
                success: true,
                message: "Ticket validé avec succès !",
                ticket,
                qrCode
            })

            onScanSuccess({ success: true, ticket })

        } catch (err) {
            console.error("Erreur vérification:", err)
            setScanResult({
                loading: false,
                success: false,
                message: "Erreur lors de la vérification",
                qrCode
            })
        }
    }

    function resetScan() {
        setScanResult(null)
        setError(null)
    }

    function closeScanner() {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(() => {})
            scannerRef.current = null
        }
        setScanResult(null)
        setError(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Camera className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Scanner QR</h2>
                                    <p className="text-emerald-100 text-sm">Validez les tickets instantanément</p>
                                </div>
                            </div>
                            <button
                                onClick={closeScanner}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Scanner Area */}
                    <div className="p-6">
                        {!scanResult ? (
                            <>
                                <div 
                                    id={containerId} 
                                    className="rounded-2xl overflow-hidden bg-gray-100 min-h-[300px] flex items-center justify-center"
                                >
                                    {isScanning && (
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                            <p className="text-sm">Initialisation de la caméra...</p>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-red-700 text-sm">{error}</p>
                                        <button
                                            onClick={initScanner}
                                            className="mt-2 text-red-600 font-medium text-sm hover:underline"
                                        >
                                            Réessayer
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4 text-center text-gray-500 text-sm">
                                    <p>Placez le code QR du ticket dans le cadre</p>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                {/* Result */}
                                <div className={cn(
                                    "rounded-2xl p-6",
                                    scanResult.loading ? "bg-gray-50" :
                                    scanResult.success ? "bg-green-50" : "bg-red-50"
                                )}>
                                    <div className="flex items-center justify-center mb-4">
                                        {scanResult.loading ? (
                                            <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                                        ) : scanResult.success ? (
                                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle className="w-10 h-10 text-green-600" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                                <XCircle className="w-10 h-10 text-red-600" />
                                            </div>
                                        )}
                                    </div>

                                    <p className={cn(
                                        "text-center font-bold text-lg",
                                        scanResult.loading ? "text-gray-600" :
                                        scanResult.success ? "text-green-700" : "text-red-700"
                                    )}>
                                        {scanResult.loading ? "Vérification en cours..." : scanResult.message}
                                    </p>

                                    {scanResult.ticket && (
                                        <div className="mt-4 space-y-2 text-sm">
                                            <div className="flex justify-between py-2 border-t border-gray-200">
                                                <span className="text-gray-500">Ticket ID</span>
                                                <span className="font-mono font-bold">#{scanResult.ticket.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-t border-gray-200">
                                                <span className="text-gray-500">Événement</span>
                                                <span className="font-medium">{scanResult.ticket.events?.title}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-t border-gray-200">
                                                <span className="text-gray-500">Acheteur</span>
                                                <span className="font-medium">{scanResult.ticket.users?.full_name}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-t border-gray-200">
                                                <span className="text-gray-500">Zone</span>
                                                <span className="font-medium">{scanResult.ticket.zone}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-t border-gray-200">
                                                <span className="text-gray-500">Quantité</span>
                                                <span className="font-bold">{scanResult.ticket.quantity} place(s)</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={resetScan}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Scanner un autre
                                    </button>
                                    <button
                                        onClick={closeScanner}
                                        className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
