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

    // Handle PDF download with images
    const handleDownload = async () => {
        if (onDownload) {
            onDownload()
            return
        }

        setIsDownloading(true)
        
        try {
            // Create PDF document - ticket size
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [100, 200] // Ticket size
            })

            const pageWidth = 100
            const pageHeight = 200
            const margin = 8
            let yPos = 0

            // ========== HEADER IMAGE ==========
            // Try to load the event image
            let imageData: string | null = null
            const imgSrc = imageUrl || config.defaultImage
            
            try {
                // For local images or CORS-enabled images
                const img = new Image()
                img.crossOrigin = 'anonymous'
                
                // Create a promise to load the image
                imageData = await new Promise<string>((resolve) => {
                    img.onload = () => {
                        const canvas = document.createElement('canvas')
                        canvas.width = img.width
                        canvas.height = img.height
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                            ctx.drawImage(img, 0, 0)
                            resolve(canvas.toDataURL('image/jpeg', 0.9))
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

            // Draw header image or gradient background
            const headerHeight = 60
            if (imageData) {
                try {
                    pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, headerHeight)
                    // Add dark overlay rectangle for text readability
                    pdf.setFillColor(0, 0, 0)
                    pdf.setDrawColor(0, 0, 0)
                    pdf.setFillColor(0, 0, 0)
                    // Simulate overlay with a semi-transparent rectangle approach
                } catch (e) {
                    // Fallback: gradient
                    pdf.setFillColor(76, 175, 80) // Green
                    pdf.rect(0, 0, pageWidth, headerHeight, 'F')
                }
            } else {
                // Fallback gradient
                pdf.setFillColor(76, 175, 80)
                pdf.rect(0, 0, pageWidth, headerHeight, 'F')
            }

            // ========== BRAND BADGES ==========
            // Category badge (top left)
            pdf.setFillColor(0, 0, 0, 0.6)
            pdf.roundedRect(margin, 8, 28, 8, 2, 2, 'F')
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(7)
            pdf.setFont('helvetica', 'bold')
            pdf.text(config.label.toUpperCase(), margin + 14, 13.5, { align: 'center' })

            // Brand badge (top right)
            pdf.setFillColor(0, 0, 0, 0.4)
            pdf.roundedRect(pageWidth - margin - 28, 8, 28, 8, 2, 2, 'F')
            pdf.setTextColor(255, 255, 255)
            pdf.text('Jel', pageWidth - margin - 22, 13.5)
            pdf.setTextColor(255, 215, 0) // Yellow
            pdf.text('Sa', pageWidth - margin - 15, 13.5)
            pdf.setTextColor(76, 175, 80) // Green
            pdf.text('Place', pageWidth - margin - 10, 13.5)

            // ========== TITLE ==========
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(14)
            pdf.setFont('helvetica', 'bold')
            const titleLines = pdf.splitTextToSize(title, pageWidth - margin * 2)
            const titleY = headerHeight - 10 - (titleLines.length - 1) * 5
            pdf.text(titleLines, margin, titleY)

            // ========== BODY ==========
            yPos = headerHeight + 12

            // Date & Time row
            pdf.setTextColor(150, 150, 150)
            pdf.setFontSize(7)
            pdf.setFont('helvetica', 'normal')
            pdf.text('DATE', margin, yPos)
            pdf.text('HEURE', pageWidth / 2 + 5, yPos)

            yPos += 5
            pdf.setTextColor(0, 0, 0)
            pdf.setFontSize(10)
            pdf.setFont('helvetica', 'bold')
            pdf.text(date, margin, yPos)
            pdf.text(time, pageWidth / 2 + 5, yPos)

            // Divider
            yPos += 8
            pdf.setDrawColor(220, 220, 220)
            pdf.setLineWidth(0.2)
            pdf.line(margin, yPos, pageWidth - margin, yPos)

            // Location
            yPos += 8
            pdf.setTextColor(150, 150, 150)
            pdf.setFontSize(7)
            pdf.setFont('helvetica', 'normal')
            pdf.text('LIEU', margin, yPos)

            yPos += 5
            pdf.setTextColor(0, 0, 0)
            pdf.setFontSize(10)
            pdf.setFont('helvetica', 'bold')
            const locationLines = pdf.splitTextToSize(location, pageWidth - margin * 2)
            pdf.text(locationLines, margin, yPos)

            // Zone
            yPos += 10
            pdf.setTextColor(150, 150, 150)
            pdf.setFontSize(7)
            pdf.setFont('helvetica', 'normal')
            pdf.text('ZONE', margin, yPos)

            yPos += 5
            pdf.setTextColor(76, 175, 80) // Green
            pdf.setFontSize(10)
            pdf.setFont('helvetica', 'bold')
            pdf.text(`${zoneConfig.icon} ${zoneConfig.label}`, margin, yPos)

            // Row & Seat
            if (row || seat) {
                yPos += 12
                const boxY = yPos
                const boxHeight = 20
                
                // Background box
                pdf.setFillColor(245, 245, 245)
                pdf.roundedRect(margin, boxY, pageWidth - margin * 2, boxHeight, 3, 3, 'F')

                // Row
                if (row) {
                    pdf.setTextColor(150, 150, 150)
                    pdf.setFontSize(7)
                    pdf.setFont('helvetica', 'normal')
                    pdf.text('RANGEE', margin + 15, boxY + 7)
                    
                    pdf.setTextColor(76, 175, 80)
                    pdf.setFontSize(16)
                    pdf.setFont('helvetica', 'bold')
                    pdf.text(row, margin + 15, boxY + 16)
                }

                // Vertical divider
                if (row && seat) {
                    pdf.setDrawColor(200, 200, 200)
                    pdf.setLineWidth(0.3)
                    pdf.line(pageWidth / 2, boxY + 4, pageWidth / 2, boxY + boxHeight - 4)
                }

                // Seat
                if (seat) {
                    pdf.setTextColor(150, 150, 150)
                    pdf.setFontSize(7)
                    pdf.setFont('helvetica', 'normal')
                    pdf.text('SIEGE', pageWidth / 2 + 15, boxY + 7)
                    
                    pdf.setTextColor(76, 175, 80)
                    pdf.setFontSize(16)
                    pdf.setFont('helvetica', 'bold')
                    pdf.text(seat, pageWidth / 2 + 15, boxY + 16)
                }

                yPos = boxY + boxHeight + 5
            }

            // Divider
            yPos += 3
            pdf.setDrawColor(220, 220, 220)
            pdf.setLineWidth(0.2)
            pdf.setLineDashPattern([2, 2], 0)
            pdf.line(margin, yPos, pageWidth - margin, yPos)
            pdf.setLineDashPattern([], 0)

            // Ticket ID
            yPos += 8
            pdf.setFillColor(250, 250, 250)
            pdf.roundedRect(margin, yPos, pageWidth - margin * 2, 10, 2, 2, 'F')
            
            pdf.setTextColor(150, 150, 150)
            pdf.setFontSize(7)
            pdf.setFont('helvetica', 'normal')
            pdf.text('TICKET ID', margin + 4, yPos + 4)
            
            pdf.setTextColor(80, 80, 80)
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'bold')
            pdf.text(id, margin + 4, yPos + 8)

            // Holder Name
            if (holderName) {
                yPos += 14
                pdf.setFillColor(250, 250, 250)
                pdf.roundedRect(margin, yPos, pageWidth - margin * 2, 10, 2, 2, 'F')
                
                pdf.setTextColor(150, 150, 150)
                pdf.setFontSize(7)
                pdf.setFont('helvetica', 'normal')
                pdf.text('TITULAIRE', margin + 4, yPos + 4)
                
                pdf.setTextColor(0, 0, 0)
                pdf.setFontSize(9)
                pdf.setFont('helvetica', 'bold')
                pdf.text(holderName, margin + 4, yPos + 8)
            }

            // ========== QR CODE ==========
            yPos += 18
            
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
            const qrSize = 35
            const qrX = (pageWidth - qrSize) / 2
            
            // White background for QR
            pdf.setFillColor(255, 255, 255)
            pdf.roundedRect(qrX - 4, yPos - 2, qrSize + 8, qrSize + 8, 3, 3, 'F')
            
            // Add QR code image
            pdf.addImage(qrDataUrl, 'PNG', qrX, yPos, qrSize, qrSize)

            // QR code label
            pdf.setTextColor(150, 150, 150)
            pdf.setFontSize(6)
            pdf.setFont('helvetica', 'normal')
            pdf.text('Scannez pour valider', pageWidth / 2, yPos + qrSize + 8, { align: 'center' })

            // ========== FOOTER ==========
            const footerY = pageHeight - 12
            pdf.setFillColor(0, 0, 0)
            pdf.rect(0, footerY, pageWidth, 12, 'F')

            // Brand text
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(12)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Jel', pageWidth / 2 - 12, footerY + 8)
            pdf.setTextColor(255, 215, 0)
            pdf.text('Sa', pageWidth / 2 - 2, footerY + 8)
            pdf.setTextColor(76, 175, 80)
            pdf.text('Place', pageWidth / 2 + 8, footerY + 8)

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
