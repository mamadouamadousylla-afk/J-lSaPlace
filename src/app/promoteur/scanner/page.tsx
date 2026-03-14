"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ScanLine, CheckCircle2, XCircle, AlertCircle, Camera, CameraOff, RefreshCw, QrCode, Ticket } from "lucide-react"
import jsQR from "jsqr"

type ScanResult = {
    type: "success" | "error" | "already_used"
    message: string
    ticket?: {
        id: string
        zone: string
        quantity: number
        total_price: number
        event: { title: string; date: string; location: string }
    }
}

function formatPrice(p: number) {
    return new Intl.NumberFormat("fr-FR").format(p) + " FCFA"
}

export default function ScannerPage() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animFrameRef = useRef<number | null>(null)

    const [promoter, setPromoter] = useState<any>(null)
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState<ScanResult | null>(null)
    const [scanCount, setScanCount] = useState({ success: 0, error: 0 })
    const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
    const cooldownRef = useRef(false)
    // Permanently tracks all codes scanned this session — prevents any re-scan
    const scannedCodesRef = useRef<Set<string>>(new Set())

    useEffect(() => {
        const stored = localStorage.getItem("promoter_session")
        if (stored) setPromoter(JSON.parse(stored))
    }, [])

    const startCamera = useCallback(async () => {
        setCameraError(null)
        setResult(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()
                setCameraActive(true)
                setScanning(true)
            }
        } catch {
            setCameraError("Impossible d'accéder à la caméra. Autorisez l'accès dans les paramètres du navigateur.")
        }
    }, [])

    const stopCamera = useCallback(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
            tracks.forEach(t => t.stop())
            videoRef.current.srcObject = null
        }
        setCameraActive(false)
        setScanning(false)
    }, [])

    const handleQRCode = useCallback(async (code: string) => {
        // Block if in cooldown OR if this exact code was already processed this session
        if (cooldownRef.current || scannedCodesRef.current.has(code)) {
            // If it's a known scanned code but cooldown is off, show already-used immediately
            if (!cooldownRef.current && scannedCodesRef.current.has(code)) {
                cooldownRef.current = true
                setScanning(false)
                setResult({ type: "already_used", message: "Billet déjà scanné" })
                setTimeout(() => {
                    cooldownRef.current = false
                    setResult(null)
                    setScanning(true)
                }, 2000)
            }
            return
        }

        cooldownRef.current = true
        scannedCodesRef.current.add(code) // Mark permanently in this session
        setLastScannedCode(code)
        setScanning(false)

        try {
            const res = await fetch("/api/tickets/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qr_code: code, promoter_id: promoter?.id })
            })
            const data = await res.json()

            if (res.ok && data.success) {
                setResult({ type: "success", message: "Billet valide !", ticket: data.ticket })
                setScanCount(prev => ({ ...prev, success: prev.success + 1 }))
            } else if (res.status === 409) {
                setResult({ type: "already_used", message: "Billet déjà scanné", ticket: data.ticket })
                setScanCount(prev => ({ ...prev, error: prev.error + 1 }))
            } else {
                // On error, remove from set so user can try again if needed
                scannedCodesRef.current.delete(code)
                setResult({ type: "error", message: data.error || "Billet invalide" })
                setScanCount(prev => ({ ...prev, error: prev.error + 1 }))
            }
        } catch {
            scannedCodesRef.current.delete(code)
            setResult({ type: "error", message: "Erreur de connexion" })
        }

        // Auto-resume scanning after 3 seconds
        setTimeout(() => {
            cooldownRef.current = false
            setResult(null)
            setScanning(true)
        }, 3000)
    }, [promoter])

    // QR scan loop
    useEffect(() => {
        if (!scanning || !cameraActive) return
        const tick = () => {
            const video = videoRef.current
            const canvas = canvasRef.current
            if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                const ctx = canvas.getContext("2d")
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert"
                    })
                    if (code?.data) {
                        handleQRCode(code.data)
                        return
                    }
                }
            }
            animFrameRef.current = requestAnimationFrame(tick)
        }
        animFrameRef.current = requestAnimationFrame(tick)
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
    }, [scanning, cameraActive, handleQRCode])

    useEffect(() => () => stopCamera(), [stopCamera])

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-poppins font-black text-gray-900 flex items-center gap-2">
                    <QrCode className="w-7 h-7 text-orange-500" />
                    Scanner de billets
                </h1>
                <p className="text-sm text-gray-500 mt-1">Scannez les QR codes des billets le jour de l'événement</p>
            </div>

            {/* Scan counters */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-green-600">{scanCount.success}</p>
                        <p className="text-xs text-green-500 font-medium">Billets validés</p>
                    </div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-red-500">{scanCount.error}</p>
                        <p className="text-xs text-red-400 font-medium">Billets refusés</p>
                    </div>
                </div>
            </div>

            {/* Camera / Scanner Area */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Video viewport */}
                <div className="relative w-full aspect-[4/3] bg-gray-900">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scanning overlay */}
                    {cameraActive && !result && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {/* Corner brackets */}
                            <div className="relative w-56 h-56">
                                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-orange-400 rounded-tl-lg" />
                                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-orange-400 rounded-tr-lg" />
                                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-orange-400 rounded-bl-lg" />
                                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-orange-400 rounded-br-lg" />
                                {/* Scan line animation */}
                                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-orange-400/70 animate-pulse" />
                                <ScanLine className="absolute inset-0 m-auto w-8 h-8 text-orange-400 opacity-40" />
                            </div>
                        </div>
                    )}

                    {/* Result overlay */}
                    {result && (
                        <div className={`absolute inset-0 flex items-center justify-center p-6 ${
                            result.type === "success" ? "bg-green-500/90" :
                            result.type === "already_used" ? "bg-yellow-500/90" : "bg-red-500/90"
                        }`}>
                            <div className="text-center text-white">
                                {result.type === "success" ? (
                                    <CheckCircle2 className="w-20 h-20 mx-auto mb-4" />
                                ) : result.type === "already_used" ? (
                                    <AlertCircle className="w-20 h-20 mx-auto mb-4" />
                                ) : (
                                    <XCircle className="w-20 h-20 mx-auto mb-4" />
                                )}
                                <p className="text-2xl font-black mb-2">{result.message}</p>
                                {result.ticket && (
                                    <div className="mt-3 bg-white/20 rounded-2xl px-5 py-4 text-left space-y-1.5">
                                        <p className="font-bold text-lg">{result.ticket.event?.title}</p>
                                        <p className="text-sm opacity-90">{result.ticket.event?.date}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-3 py-1 bg-white/30 rounded-full text-sm font-bold">
                                                Zone {result.ticket.zone}
                                            </span>
                                            <span className="px-3 py-1 bg-white/30 rounded-full text-sm font-bold">
                                                {result.ticket.quantity} billet{result.ticket.quantity > 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <p className="text-sm mt-4 opacity-70">Reprise automatique dans 3s...</p>
                            </div>
                        </div>
                    )}

                    {/* No camera state */}
                    {!cameraActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-500">
                            <CameraOff className="w-16 h-16 text-gray-400" />
                            <p className="text-sm font-medium">Caméra inactive</p>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-5 border-t border-gray-100">
                    {cameraError && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {cameraError}
                        </div>
                    )}

                    {!cameraActive ? (
                        <button
                            onClick={startCamera}
                            className="w-full py-4 bg-orange-500 text-white font-black rounded-xl flex items-center justify-center gap-3 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                        >
                            <Camera className="w-6 h-6" />
                            Démarrer le scanner
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setResult(null); cooldownRef.current = false; setScanning(true) }}
                                className="flex-1 py-3.5 bg-orange-50 border border-orange-200 text-orange-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Scanner suivant
                            </button>
                            <button
                                onClick={stopCamera}
                                className="flex-1 py-3.5 bg-red-50 border border-red-200 text-red-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                            >
                                <CameraOff className="w-4 h-4" />
                                Arrêter
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-orange-800 flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Comment utiliser le scanner
                </h3>
                <ul className="space-y-2 text-sm text-orange-700">
                    <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                        Appuyez sur <strong>"Démarrer le scanner"</strong> et autorisez l'accès à la caméra
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                        Pointez la caméra vers le QR code sur le billet du spectateur
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                        <span><strong className="text-green-700">Vert</strong> = billet valide | <strong className="text-yellow-700">Jaune</strong> = déjà utilisé | <strong className="text-red-700">Rouge</strong> = invalide</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                        Le scanner reprend automatiquement après 3 secondes
                    </li>
                </ul>
            </div>
        </div>
    )
}
