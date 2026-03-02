"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, MapPin, Download, Music, Mic2, Users, Presentation, Sparkles } from "lucide-react"
import Qoder from "./Qoder"
import jsPDF from "jspdf"
import QRCode from "qrcode"

// Brand colors from Jël Sa Place logo
export const BRAND_COLORS = {
    jel: "#FFFFFF",      // White for "Jël"
    sa: "#FFD700",       // Yellow for "Sa"
    place: "#4CAF50",    // Green for "Place"
    black: "#000000",
    darkBg: "#1A1A1A",
    gradient: "from-white via-yellow-400 to-green-500"
}

// Category configurations with Jël Sa Place branding
export const CATEGORY_CONFIG: Record<string, {
    label: string
    icon: React.ReactNode
    gradient: string
    gradientColors: [string, string, string] // For PDF
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
        gradientColors: ["#22C55E", "#10B981", "#0D9488"],
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
        gradientColors: ["#FBBF24", "#F59E0B", "#F97316"],
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
        gradientColors: ["#FDE047", "#FBBF24", "#EAB308"],
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
        gradientColors: ["#4ADE80", "#10B981", "#0D9488"],
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
        gradientColors: ["#22C55E", "#14B8A6", "#0891B2"],
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
    
    // Get category config or default to SPORT
    const config = CATEGORY_CONFIG[category?.toUpperCase()] || CATEGORY_CONFIG.SPORT
    
    // Get zone label
    const zoneConfig = config.zoneLabels[zone?.toLowerCase()] || { label: zone, icon: "🎫" }
    
    // Generate QR code value
    const qrValue = qrCode || id

    // Handle PDF download - exact replica of visual ticket
    const handleDownload = async () => {
        if (onDownload) {
            onDownload()
            return
        }

        setIsDownloading(true)
        
        try {
            // Create PDF document - ticket size (proportional to visual card)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [100, 210] // Ticket proportions
            })

            const pageWidth = 100
            const pageHeight = 210
            const margin = 8
            let yPos = 0

            // ========== HEADER IMAGE WITH GRADIENT ==========
            const headerHeight = 70
            
            // Try to load the event image
            const imgSrc = imageUrl || config.defaultImage
            let imageData: string | null = null
            
            try {
                const img = new Image()
                img.crossOrigin = 'anonymous'
                
                imageData = await new Promise<string>((resolve) => {
                    img.onload = () => {
                        const canvas = document.createElement('canvas')
                        canvas.width = img.width
                        canvas.height = img.height
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                            ctx.drawImage(img, 0, 0)
                            resolve(canvas.toDataURL('image/jpeg', 0.95))
                        } else {
                            resolve('')
                        }
                    }
                    img.onerror = () => resolve('')
                    img.src = imgSrc
                })
            } catch (e) {
                console.log('Could not load image:', e)
            }

            // Draw header image
            if (imageData) {
                try {
                    pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, headerHeight)
                } catch (e) {
                    pdf.setFillColor(76, 175, 80)
                    pdf.rect(0, 0, pageWidth, headerHeight, 'F')
                }
            } else {
                pdf.setFillColor(76, 175, 80)
                pdf.rect(0, 0, pageWidth, headerHeight, 'F')
            }

            // ========== GRADIENT OVERLAY ==========
            // Draw gradient overlay (multiple semi-transparent rectangles)
            const gradientSteps = 20
            const [color1, color2, color3] = config.gradientColors
            
            for (let i = 0; i < gradientSteps; i++) {
                const ratio = i / gradientSteps
                // Interpolate colors
                let r, g, b
                
                if (ratio < 0.5) {
                    // From color1 to color2
                    const localRatio = ratio * 2
                    r = Math.round(parseInt(color1.slice(1, 3), 16) * (1 - localRatio) + parseInt(color2.slice(1, 3), 16) * localRatio)
                    g = Math.round(parseInt(color1.slice(3, 5), 16) * (1 - localRatio) + parseInt(color2.slice(3, 5), 16) * localRatio)
                    b = Math.round(parseInt(color1.slice(5, 7), 16) * (1 - localRatio) + parseInt(color2.slice(5, 7), 16) * localRatio)
                } else {
                    // From color2 to color3
                    const localRatio = (ratio - 0.5) * 2
                    r = Math.round(parseInt(color2.slice(1, 3), 16) * (1 - localRatio) + parseInt(color3.slice(1, 3), 16) * localRatio)
                    g = Math.round(parseInt(color2.slice(3, 5), 16) * (1 - localRatio) + parseInt(color3.slice(3, 5), 16) * localRatio)
                    b = Math.round(parseInt(color2.slice(5, 7), 16) * (1 - localRatio) + parseInt(color3.slice(5, 7), 16) * localRatio)
                }

                // Set fill with opacity (simulating gradient with transparency)
                pdf.setFillColor(r, g, b)
                const rectHeight = headerHeight / gradientSteps
                const yPos = i * rectHeight
                
                // Draw multiple times with different opacities for better gradient effect
                pdf.setFillColor(r, g, b)
                pdf.rect(0, yPos, pageWidth, rectHeight + 1, 'F')
            }

            // Dark overlay at bottom for text readability
            for (let i = 0; i < 10; i++) {
                const opacity = i / 10
                const yPos = headerHeight - 25 + (i * 2.5)
                pdf.setFillColor(0, 0, 0)
                pdf.rect(0, yPos, pageWidth, 3, 'F')
            }

            // ========== BRAND BADGES ==========
            // Category badge (top left) - rounded pill
            const badgeWidth = 28
            const badgeHeight = 9
            pdf.setFillColor(0, 0, 0)
            // Simulate rounded rect with multiple small rects
            for (let i = 0; i < 5; i++) {
                const w = badgeWidth - (i * 2)
                const xOffset = i
                pdf.rect(margin + xOffset, 10 + i * 0.1, w, badgeHeight - i * 0.2, 'F')
            }
            pdf.roundedRect(margin, 10, badgeWidth, badgeHeight, 3, 3, 'F')
            
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'bold')
            pdf.text(config.label.toUpperCase(), margin + badgeWidth / 2, 16, { align: 'center' })

            // Brand badge (top right) - Jël Sa Place
            const brandWidth = 30
            pdf.setFillColor(0, 0, 0, 0.6)
            pdf.roundedRect(pageWidth - margin - brandWidth, 10, brandWidth, badgeHeight, 3, 3, 'F')
            
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(7)
            pdf.text('Jel', pageWidth - margin - brandWidth + 5, 16)
            pdf.setTextColor(255, 215, 0) // Yellow
            pdf.text('Sa', pageWidth - margin - brandWidth + 12, 16)
            pdf.setTextColor(76, 175, 80) // Green
            pdf.text('Place', pageWidth - margin - brandWidth + 17, 16)

            // ========== TITLE ==========
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(16)
            pdf.setFont('helvetica', 'bold')
            const titleLines = pdf.splitTextToSize(title, pageWidth - margin * 2)
            const titleY = headerHeight - 8 - (titleLines.length - 1) * 6
            pdf.text(titleLines, margin, titleY)

            // ========== WHITE CARD BODY ==========
            yPos = headerHeight + 2
            
            // White rounded card background
            pdf.setFillColor(255, 255, 255)
            pdf.roundedRect(2, yPos - 2, pageWidth - 4, pageHeight - headerHeight - 20, 6, 6, 'F')

            yPos += 15

            // Date & Time row
            pdf.setTextColor(160, 160, 160)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'normal')
            pdf.text('DATE', margin, yPos)
            pdf.text('HEURE', pageWidth / 2 + 5, yPos)

            yPos += 5
            pdf.setTextColor(0, 0, 0)
            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'bold')
            pdf.text(date, margin, yPos)
            pdf.text(time, pageWidth / 2 + 5, yPos)

            // Location
            yPos += 10
            pdf.setTextColor(160, 160, 160)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'normal')
            pdf.text('LIEU', margin, yPos)

            yPos += 5
            pdf.setTextColor(0, 0, 0)
            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'bold')
            const locationLines = pdf.splitTextToSize(location, pageWidth - margin * 2)
            pdf.text(locationLines, margin, yPos)

            // Zone
            yPos += 10
            pdf.setTextColor(160, 160, 160)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'normal')
            pdf.text('ZONE', margin, yPos)

            yPos += 5
            pdf.setTextColor(76, 175, 80) // Green
            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'bold')
            pdf.text(`${zoneConfig.icon} ${zoneConfig.label}`, margin, yPos)

            // Row & Seat box
            if (row || seat) {
                yPos += 12
                const boxHeight = 22
                
                // Background box
                pdf.setFillColor(245, 245, 245)
                pdf.roundedRect(margin, yPos, pageWidth - margin * 2, boxHeight, 4, 4, 'F')

                // Row
                if (row) {
                    pdf.setTextColor(160, 160, 160)
                    pdf.setFontSize(8)
                    pdf.setFont('helvetica', 'normal')
                    pdf.text('RANGEE', margin + 15, yPos + 8)
                    
                    pdf.setTextColor(76, 175, 80)
                    pdf.setFontSize(18)
                    pdf.setFont('helvetica', 'bold')
                    pdf.text(row, margin + 15, yPos + 18)
                }

                // Vertical divider
                if (row && seat) {
                    pdf.setDrawColor(200, 200, 200)
                    pdf.setLineWidth(0.3)
                    pdf.line(pageWidth / 2, yPos + 5, pageWidth / 2, yPos + boxHeight - 5)
                }

                // Seat
                if (seat) {
                    pdf.setTextColor(160, 160, 160)
                    pdf.setFontSize(8)
                    pdf.setFont('helvetica', 'normal')
                    pdf.text('SIEGE', pageWidth / 2 + 15, yPos + 8)
                    
                    pdf.setTextColor(76, 175, 80)
                    pdf.setFontSize(18)
                    pdf.setFont('helvetica', 'bold')
                    pdf.text(seat, pageWidth / 2 + 15, yPos + 18)
                }

                yPos += boxHeight + 8
            } else {
                yPos += 5
            }

            // Ticket ID
            pdf.setFillColor(250, 250, 250)
            pdf.roundedRect(margin, yPos, pageWidth - margin * 2, 12, 3, 3, 'F')
            
            pdf.setTextColor(160, 160, 160)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'normal')
            pdf.text('TICKET ID', margin + 5, yPos + 5)
            
            pdf.setTextColor(80, 80, 80)
            pdf.setFontSize(9)
            pdf.setFont('helvetica', 'bold')
            pdf.text(id, margin + 5, yPos + 10)

            // Holder Name
            if (holderName) {
                yPos += 16
                pdf.setFillColor(250, 250, 250)
                pdf.roundedRect(margin, yPos, pageWidth - margin * 2, 12, 3, 3, 'F')
                
                pdf.setTextColor(160, 160, 160)
                pdf.setFontSize(8)
                pdf.setFont('helvetica', 'normal')
                pdf.text('TITULAIRE', margin + 5, yPos + 5)
                
                pdf.setTextColor(0, 0, 0)
                pdf.setFontSize(10)
                pdf.setFont('helvetica', 'bold')
                pdf.text(holderName, margin + 5, yPos + 10)
            }

            // ========== QR CODE ==========
            yPos += 20
            
            // Generate QR code as image
            const qrDataUrl = await QRCode.toDataURL(qrValue, {
                width: 200,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            })

            // QR code container
            const qrSize = 38
            const qrX = (pageWidth - qrSize) / 2
            
            // White background for QR
            pdf.setFillColor(255, 255, 255)
            pdf.roundedRect(qrX - 5, yPos - 3, qrSize + 10, qrSize + 10, 4, 4, 'F')
            
            // Add QR code image
            pdf.addImage(qrDataUrl, 'PNG', qrX, yPos, qrSize, qrSize)

            // QR code label
            pdf.setTextColor(160, 160, 160)
            pdf.setFontSize(7)
            pdf.setFont('helvetica', 'normal')
            pdf.text('Scannez pour valider', pageWidth / 2, yPos + qrSize + 10, { align: 'center' })

            // ========== FOOTER ==========
            const footerY = pageHeight - 14
            pdf.setFillColor(0, 0, 0)
            pdf.rect(0, footerY, pageWidth, 14, 'F')

            // Brand text centered
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(14)
            pdf.setFont('helvetica', 'bold')
            const brandCenter = pageWidth / 2
            pdf.text('Jel', brandCenter - 15, footerY + 9)
            pdf.setTextColor(255, 215, 0) // Yellow
            pdf.text('Sa', brandCenter - 5, footerY + 9)
            pdf.setTextColor(76, 175, 80) // Green
            pdf.text('Place', brandCenter + 5, footerY + 9)

            // Download the PDF
            pdf.save(`ticket-${id}.pdf`)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className="relative w-full max-w-sm mx-auto">
            {/* Main Ticket Card */}
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
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20`}>
                            <span className="text-white">{config.icon}</span>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {config.label}
                            </span>
                        </div>
                    </div>
                    
                    {/* Jël Sa Place Brand Mark */}
                    <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                            <span className="text-xs font-black text-white">Jel</span>
                            <span className="text-xs font-black text-yellow-400">Sa</span>
                            <span className="text-xs font-black text-green-400">Place</span>
                        </div>
                    </div>
                    
                    {/* Title */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-xl font-black text-white leading-tight line-clamp-2 drop-shadow-lg">
                            {title}
                        </h2>
                    </div>
                </div>

                {/* Ticket Body */}
                <div className="p-5 space-y-5">
                    {/* Event Details Grid */}
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

                    {/* Seat Info */}
                    {(row || seat) && (
                        <div className="flex items-center justify-center gap-6 py-3 px-4 rounded-xl bg-gray-50">
                            {row && (
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Rangee</p>
                                    <p className="text-lg font-black" style={{ color: config.textColor }}>{row}</p>
                                </div>
                            )}
                            {row && seat && (
                                <div className="w-px h-8 bg-gray-300" />
                            )}
                            {seat && (
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Siege</p>
                                    <p className="text-lg font-black" style={{ color: config.textColor }}>{seat}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ticket ID */}
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket ID</p>
                        <p className="text-xs font-mono font-bold text-gray-600">{id}</p>
                    </div>

                    {/* Holder Name */}
                    {holderName && (
                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titulaire</p>
                            <p className="text-sm font-bold text-gray-900">{holderName}</p>
                        </div>
                    )}

                    {/* QR Code Section */}
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

                {/* Decorative Elements */}
                <div className="absolute -left-3 top-28 w-6 h-6 rounded-full bg-gray-100" />
                <div className="absolute -right-3 top-28 w-6 h-6 rounded-full bg-gray-100" />
                
                {/* Jël Sa Place Brand Footer */}
                <div className="bg-black py-3 px-4 flex items-center justify-center gap-1">
                    <span className="text-xs font-black text-white">Jel</span>
                    <span className="text-xs font-black text-yellow-400">Sa</span>
                    <span className="text-xs font-black text-green-400">Place</span>
                </div>
            </div>

            {/* Shadow Effect */}
            <div 
                className={`absolute -bottom-4 left-4 right-4 h-8 rounded-[2rem] bg-green-500 opacity-20 blur-xl`}
            />
        </div>
    )
}
