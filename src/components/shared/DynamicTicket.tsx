"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, MapPin, Download, Music, Mic2, Users, Presentation, Sparkles } from "lucide-react"
import Qoder from "./Qoder"
import jsPDF from "jspdf"
import QRCode from "qrcode"

// Brand colors from Jël Sa Place logo
export const BRAND_COLORS = {
    jel: "#FFFFFF",
    sa: "#FFD700",
    place: "#4CAF50",
    black: "#000000",
    darkBg: "#1A1A1A",
    gradient: "from-white via-yellow-400 to-green-500"
}

// Category configurations
export const CATEGORY_CONFIG: Record<string, {
    label: string
    icon: React.ReactNode
    gradient: string
    gradientColors: { start: string; middle: string; end: string }
    bgGradient: string
    accentColor: string
    textColor: string
    defaultImage: string
    zoneLabels: Record<string, { label: string; icon: string }>
}> = {
    SPORT: {
        label: "Sport",
        icon: <Sparkles className="w-5 h-5" />,
        gradient: "from-green-500 via-emerald-500 to-teal-600",
        gradientColors: { start: "#22C55E", middle: "#10B981", end: "#0D9488" },
        bgGradient: "from-green-500/10 via-emerald-500/10 to-teal-600/10",
        accentColor: BRAND_COLORS.place,
        textColor: "#059669",
        defaultImage: "/hero-combat.png",
        zoneLabels: {
            vip: { label: "VIP Ringside", icon: "🏆" },
            tribune: { label: "Tribune", icon: "🏟️" },
            pelouse: { label: "Pelouse", icon: "🌿" }
        }
    },
    MUSIQUE: {
        label: "Musique",
        icon: <Music className="w-5 h-5" />,
        gradient: "from-yellow-400 via-amber-500 to-orange-500",
        gradientColors: { start: "#FBBF24", middle: "#F59E0B", end: "#F97316" },
        bgGradient: "from-yellow-400/10 via-amber-500/10 to-orange-500/10",
        accentColor: BRAND_COLORS.sa,
        textColor: "#D97706",
        defaultImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
        zoneLabels: {
            vip: { label: "VIP Backstage", icon: "🎤" },
            tribune: { label: "Tribune Or", icon: "⭐" },
            pelouse: { label: "Fosse Générale", icon: "🎭" }
        }
    },
    HUMOUR: {
        label: "Humour",
        icon: <Mic2 className="w-5 h-5" />,
        gradient: "from-yellow-300 via-amber-400 to-yellow-500",
        gradientColors: { start: "#FDE047", middle: "#FBBF24", end: "#EAB308" },
        bgGradient: "from-yellow-300/10 via-amber-400/10 to-yellow-500/10",
        accentColor: "#FBBF24",
        textColor: "#B45309",
        defaultImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80",
        zoneLabels: {
            vip: { label: "Premium", icon: "👑" },
            tribune: { label: "Standard", icon: "😄" },
            pelouse: { label: "Étudiant", icon: "🎓" }
        }
    },
    LOISIRS: {
        label: "Loisirs",
        icon: <Users className="w-5 h-5" />,
        gradient: "from-green-400 via-emerald-500 to-teal-600",
        gradientColors: { start: "#4ADE80", middle: "#10B981", end: "#0D9488" },
        bgGradient: "from-green-400/10 via-emerald-500/10 to-teal-600/10",
        accentColor: "#10B981",
        textColor: "#059669",
        defaultImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        zoneLabels: {
            vip: { label: "VIP Prestige", icon: "💎" },
            tribune: { label: "Tribune Privilège", icon: "🥂" },
            pelouse: { label: "Accès Général", icon: "🎉" }
        }
    },
    CONFERENCE: {
        label: "Conférence",
        icon: <Presentation className="w-5 h-5" />,
        gradient: "from-green-500 via-teal-500 to-cyan-600",
        gradientColors: { start: "#22C55E", middle: "#14B8A6", end: "#0891B2" },
        bgGradient: "from-green-500/10 via-teal-500/10 to-cyan-600/10",
        accentColor: "#14B8A6",
        textColor: "#0D9488",
        defaultImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
        zoneLabels: {
            vip: { label: "Business Class", icon: "💼" },
            tribune: { label: "Standard", icon: "📋" },
            pelouse: { label: "Étudiant", icon: "📚" }
        }
    }
}

export interface DynamicTicketProps {
    id: string
    title: string
    date: string
    time: string
    location: string
    category: string
    zone: string
    row?: string
    seat?: string
    imageUrl?: string
    qrCode?: string
    holderName?: string
    onDownload?: () => void
    compact?: boolean
}

export default function DynamicTicket({
    id,
    title,
    date,
    time,
    location,
    category,
    zone,
    row,
    seat,
    imageUrl,
    qrCode,
    holderName,
    onDownload,
    compact = false
}: DynamicTicketProps) {
    const [isDownloading, setIsDownloading] = useState(false)
    
    const config = CATEGORY_CONFIG[category?.toUpperCase()] || CATEGORY_CONFIG.SPORT
    const zoneConfig = config.zoneLabels[zone?.toLowerCase()] || { label: zone, icon: "🎫" }
    const qrValue = qrCode || id

    // Create header image with gradient overlay using Canvas
    const createHeaderWithGradient = async (): Promise<string | null> => {
        return new Promise(async (resolve) => {
            try {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    resolve(null)
                    return
                }

                // Set canvas size (proportional to PDF)
                const width = 400
                const height = 300
                canvas.width = width
                canvas.height = height

                // Load event image
                const img = new Image()
                img.crossOrigin = 'anonymous'
                
                img.onload = () => {
                    // Draw image
                    ctx.drawImage(img, 0, 0, width, height)

                    // Create gradient overlay with transparency
                    const gradient = ctx.createLinearGradient(0, 0, 0, height)
                    const { start, middle, end } = config.gradientColors
                    
                    // Add color stops with opacity (0.6 = 60% opacity)
                    gradient.addColorStop(0, start + '99')     // 60% opacity
                    gradient.addColorStop(0.5, middle + '99')  // 60% opacity
                    gradient.addColorStop(1, end + '99')       // 60% opacity

                    // Draw gradient overlay
                    ctx.fillStyle = gradient
                    ctx.fillRect(0, 0, width, height)

                    // Add dark gradient at bottom for text
                    const darkGradient = ctx.createLinearGradient(0, height - 100, 0, height)
                    darkGradient.addColorStop(0, 'rgba(0,0,0,0)')
                    darkGradient.addColorStop(1, 'rgba(0,0,0,0.8)')
                    ctx.fillStyle = darkGradient
                    ctx.fillRect(0, height - 100, width, 100)

                    // Convert to data URL
                    resolve(canvas.toDataURL('image/png'))
                }
                
                img.onerror = () => {
                    // Fallback: create gradient without image
                    const gradient = ctx.createLinearGradient(0, 0, 0, height)
                    const { start, middle, end } = config.gradientColors
                    gradient.addColorStop(0, start)
                    gradient.addColorStop(0.5, middle)
                    gradient.addColorStop(1, end)
                    ctx.fillStyle = gradient
                    ctx.fillRect(0, 0, width, height)
                    
                    const darkGradient = ctx.createLinearGradient(0, height - 100, 0, height)
                    darkGradient.addColorStop(0, 'rgba(0,0,0,0)')
                    darkGradient.addColorStop(1, 'rgba(0,0,0,0.8)')
                    ctx.fillStyle = darkGradient
                    ctx.fillRect(0, height - 100, width, 100)
                    
                    resolve(canvas.toDataURL('image/png'))
                }
                
                img.src = imageUrl || config.defaultImage
            } catch (e) {
                console.error('Error creating header:', e)
                resolve(null)
            }
        })
    }

    const handleDownload = async () => {
        if (onDownload) {
            onDownload()
            return
        }

        setIsDownloading(true)
        
        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [100, 250] // Increased height for QR and footer
            })

            const pageWidth = 100
            const pageHeight = 250
            const margin = 8
            const headerHeight = 80

            // ========== CREATE HEADER WITH CANVAS ==========
            const headerImage = await createHeaderWithGradient()
            
            if (headerImage) {
                pdf.addImage(headerImage, 'PNG', 0, 0, pageWidth, headerHeight)
            } else {
                // Fallback solid color
                const { start } = config.gradientColors
                pdf.setFillColor(parseInt(start.slice(1, 3), 16), parseInt(start.slice(3, 5), 16), parseInt(start.slice(5, 7), 16))
                pdf.rect(0, 0, pageWidth, headerHeight, 'F')
            }

            // ========== BRAND BADGES ==========
            // Category badge (top left)
            pdf.setFillColor(0, 0, 0)
            pdf.roundedRect(margin, 10, 30, 10, 5, 5, 'F')
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(9)
            pdf.setFont('helvetica', 'bold')
            pdf.text(config.label.toUpperCase(), margin + 15, 17, { align: 'center' })

            // Brand badge (top right)
            pdf.setFillColor(0, 0, 0)
            pdf.roundedRect(pageWidth - margin - 35, 10, 35, 10, 5, 5, 'F')
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(8)
            pdf.text('Jel', pageWidth - margin - 28, 17)
            pdf.setTextColor(255, 215, 0)
            pdf.text('Sa', pageWidth - margin - 19, 17)
            pdf.setTextColor(76, 175, 80)
            pdf.text('Place', pageWidth - margin - 13, 17)

            // ========== TITLE ON HEADER ==========
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(18)
            pdf.setFont('helvetica', 'bold')
            const titleLines = pdf.splitTextToSize(title, pageWidth - margin * 2)
            const titleY = headerHeight - 10 - (titleLines.length - 1) * 7
            pdf.text(titleLines, margin, titleY)

            // ========== WHITE CARD BODY ==========
            let yPos = headerHeight + 5
            
            // White rounded card
            pdf.setFillColor(255, 255, 255)
            pdf.roundedRect(3, yPos, pageWidth - 6, pageHeight - headerHeight - 20, 8, 8, 'F')

            yPos += 18

            // ========== DATE & TIME ==========
            pdf.setTextColor(150, 150, 150)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'normal')
            pdf.text('DATE', margin + 2, yPos)
            pdf.text('HEURE', pageWidth / 2 + 5, yPos)

            yPos += 6
            pdf.setTextColor(0, 0, 0)
            pdf.setFontSize(12)
            pdf.setFont('helvetica', 'bold')
            pdf.text(date, margin + 2, yPos)
            pdf.text(time, pageWidth / 2 + 5, yPos)

            // ========== LOCATION ==========
            yPos += 12
            pdf.setTextColor(150, 150, 150)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'normal')
            pdf.text('LIEU', margin + 2, yPos)

            yPos += 6
            pdf.setTextColor(0, 0, 0)
            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'bold')
            const locationLines = pdf.splitTextToSize(location, pageWidth - margin * 2 - 4)
            pdf.text(locationLines, margin + 2, yPos)

            // ========== ZONE ==========
            yPos += 12
            pdf.setTextColor(150, 150, 150)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'normal')
            pdf.text('ZONE', margin + 2, yPos)

            yPos += 6
            pdf.setTextColor(76, 175, 80)
            pdf.setFontSize(12)
            pdf.setFont('helvetica', 'bold')
            pdf.text(`${zoneConfig.icon} ${zoneConfig.label}`, margin + 2, yPos)

            // ========== ROW & SEAT ==========
            if (row || seat) {
                yPos += 14
                const boxHeight = 25
                
                // Background box
                pdf.setFillColor(245, 245, 245)
                pdf.roundedRect(margin + 2, yPos, pageWidth - margin * 2 - 4, boxHeight, 5, 5, 'F')

                // Row
                if (row) {
                    pdf.setTextColor(150, 150, 150)
                    pdf.setFontSize(9)
                    pdf.setFont('helvetica', 'normal')
                    pdf.text('RANGEE', margin + 18, yPos + 9)
                    
                    pdf.setTextColor(76, 175, 80)
                    pdf.setFontSize(20)
                    pdf.setFont('helvetica', 'bold')
                    pdf.text(row, margin + 18, yPos + 21)
                }

                // Divider
                if (row && seat) {
                    pdf.setDrawColor(200, 200, 200)
                    pdf.setLineWidth(0.3)
                    pdf.line(pageWidth / 2, yPos + 6, pageWidth / 2, yPos + boxHeight - 6)
                }

                // Seat
                if (seat) {
                    pdf.setTextColor(150, 150, 150)
                    pdf.setFontSize(9)
                    pdf.setFont('helvetica', 'normal')
                    pdf.text('SIEGE', pageWidth / 2 + 15, yPos + 9)
                    
                    pdf.setTextColor(76, 175, 80)
                    pdf.setFontSize(20)
                    pdf.setFont('helvetica', 'bold')
                    pdf.text(seat, pageWidth / 2 + 15, yPos + 21)
                }

                yPos += boxHeight + 10
            } else {
                yPos += 6
            }

            // ========== TICKET ID ==========
            pdf.setFillColor(250, 250, 250)
            pdf.roundedRect(margin + 2, yPos, pageWidth - margin * 2 - 4, 14, 4, 4, 'F')
            
            pdf.setTextColor(150, 150, 150)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'normal')
            pdf.text('TICKET ID', margin + 6, yPos + 5)
            
            pdf.setTextColor(80, 80, 80)
            pdf.setFontSize(10)
            pdf.setFont('helvetica', 'bold')
            pdf.text(id, margin + 6, yPos + 11)

            // ========== HOLDER ==========
            if (holderName) {
                yPos += 18
                pdf.setFillColor(250, 250, 250)
                pdf.roundedRect(margin + 2, yPos, pageWidth - margin * 2 - 4, 14, 4, 4, 'F')
                
                pdf.setTextColor(150, 150, 150)
                pdf.setFontSize(8)
                pdf.setFont('helvetica', 'normal')
                pdf.text('TITULAIRE', margin + 6, yPos + 5)
                
                pdf.setTextColor(0, 0, 0)
                pdf.setFontSize(11)
                pdf.setFont('helvetica', 'bold')
                pdf.text(holderName, margin + 6, yPos + 11)
            }

            // ========== QR CODE ==========
            yPos += 15
            
            const qrDataUrl = await QRCode.toDataURL(qrValue, {
                width: 400,
                margin: 1,
                color: { dark: '#000000', light: '#ffffff' }
            })

            const qrSize = 35 // Smaller size to fit completely
            const qrX = (pageWidth - qrSize) / 2

            // White background
            pdf.setFillColor(255, 255, 255)
            pdf.roundedRect(qrX - 5, yPos - 3, qrSize + 10, qrSize + 10, 4, 4, 'F')

            // Border
            pdf.setDrawColor(200, 200, 200)
            pdf.setLineWidth(0.4)
            pdf.roundedRect(qrX - 2, yPos, qrSize + 4, qrSize + 4, 2, 2, 'S')

            // QR code image
            pdf.addImage(qrDataUrl, 'PNG', qrX, yPos + 2, qrSize, qrSize)

            // Label
            pdf.setTextColor(120, 120, 120)
            pdf.setFontSize(7)
            pdf.setFont('helvetica', 'normal')
            pdf.text('Scannez pour valider', pageWidth / 2, yPos + qrSize + 12, { align: 'center' })

            // ========== FOOTER ==========
            const footerY = pageHeight - 18
            pdf.setFillColor(0, 0, 0)
            pdf.rect(0, footerY, pageWidth, 18, 'F')

            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(18)
            pdf.setFont('helvetica', 'bold')
            const centerX = pageWidth / 2
            pdf.text('Jel', centerX - 18, footerY + 12)
            pdf.setTextColor(255, 215, 0)
            pdf.text('Sa', centerX - 6, footerY + 12)
            pdf.setTextColor(76, 175, 80)
            pdf.text('Place', centerX + 6, footerY + 12)

            // Download
            pdf.save(`ticket-${id}.pdf`)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Erreur lors de la génération du PDF.')
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className="relative w-full max-w-sm mx-auto">
            <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100">
                {/* Hero Image with Gradient Overlay */}
                <div className="relative h-48 overflow-hidden">
                    <img 
                        src={imageUrl || config.defaultImage} 
                        alt={title}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${config.gradient} opacity-60`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                            <span className="text-white">{config.icon}</span>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {config.label}
                            </span>
                        </div>
                    </div>
                    
                    <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                            <span className="text-xs font-black text-white">Jel</span>
                            <span className="text-xs font-black text-yellow-400">Sa</span>
                            <span className="text-xs font-black text-green-400">Place</span>
                        </div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-xl font-black text-white leading-tight line-clamp-2 drop-shadow-lg">
                            {title}
                        </h2>
                    </div>
                </div>

                {/* Ticket Body */}
                <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 mt-0.5" style={{ color: config.accentColor }} />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</p>
                                    <p className="text-sm font-bold text-gray-900">{date}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5" style={{ color: config.accentColor }} />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lieu</p>
                                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{location}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Heure</p>
                                <p className="text-sm font-bold text-gray-900">{time}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zone</p>
                                <div className="flex items-center gap-1.5">
                                    <span>{zoneConfig.icon}</span>
                                    <p className="text-sm font-bold" style={{ color: config.textColor }}>
                                        {zoneConfig.label}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(row || seat) && (
                        <div className="flex items-center justify-center gap-6 py-3 px-4 rounded-xl bg-gray-50">
                            {row && (
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Rangee</p>
                                    <p className="text-lg font-black" style={{ color: config.textColor }}>{row}</p>
                                </div>
                            )}
                            {row && seat && <div className="w-px h-8 bg-gray-300" />}
                            {seat && (
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Siege</p>
                                    <p className="text-lg font-black" style={{ color: config.textColor }}>{seat}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket ID</p>
                        <p className="text-xs font-mono font-bold text-gray-600">{id}</p>
                    </div>

                    {holderName && (
                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titulaire</p>
                            <p className="text-sm font-bold text-gray-900">{holderName}</p>
                        </div>
                    )}

                    {/* QR Code */}
                    {!compact && (
                        <div className="flex flex-col items-center pt-3 border-t border-dashed border-gray-200">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                <Qoder value={qrValue} size={120} />
                            </div>
                            <p className="text-[10px] font-mono text-gray-400 mt-2">
                                Scannez pour valider
                            </p>
                        </div>
                    )}

                    {/* Download Button */}
                    {!compact && (
                        <div className="pt-2">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className={`w-full py-4 rounded-xl bg-gradient-to-r ${config.gradient} text-white font-bold flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all ${isDownloading ? 'opacity-70' : ''}`}
                            >
                                <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
                                {isDownloading ? 'Generation...' : 'Telecharger'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="absolute -left-3 top-28 w-6 h-6 rounded-full bg-gray-100" />
                <div className="absolute -right-3 top-28 w-6 h-6 rounded-full bg-gray-100" />
                
                <div className="bg-black py-3 px-4 flex items-center justify-center gap-1">
                    <span className="text-xs font-black text-white">Jel</span>
                    <span className="text-xs font-black text-yellow-400">Sa</span>
                    <span className="text-xs font-black text-green-400">Place</span>
                </div>
            </div>

            <div className="absolute -bottom-4 left-4 right-4 h-8 rounded-[2rem] bg-green-500 opacity-20 blur-xl" />
        </div>
    )
}
