"use client"

import { motion } from "framer-motion"
import { Calendar, MapPin, Download, Music, Mic2, Users, Presentation, Sparkles } from "lucide-react"
import Qoder from "./Qoder"
import jsPDF from "jspdf"

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
    // Get category config or default to SPORT
    const config = CATEGORY_CONFIG[category?.toUpperCase()] || CATEGORY_CONFIG.SPORT
    
    // Get zone label
    const zoneConfig = config.zoneLabels[zone?.toLowerCase()] || { label: zone, icon: "🎫" }
    
    // Generate QR code value
    const qrValue = qrCode || id

    // Handle PDF download - Generate directly with jsPDF
    const handleDownload = async () => {
        if (onDownload) {
            onDownload()
            return
        }

        try {
            // Create PDF document
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [80, 160] // Ticket size (like a real ticket)
            })

            // Colors
            const greenColor: [number, number, number] = [76, 175, 80]
            const yellowColor: [number, number, number] = [255, 215, 0]
            const blackColor: [number, number, number] = [0, 0, 0]
            const whiteColor: [number, number, number] = [255, 255, 255]
            const grayColor: [number, number, number] = [150, 150, 150]

            // Header with gradient effect (simulated with rectangles)
            pdf.setFillColor(...greenColor)
            pdf.rect(0, 0, 80, 35, 'F')
            
            // Add yellow accent stripe
            pdf.setFillColor(...yellowColor)
            pdf.rect(0, 32, 80, 3, 'F')

            // Brand name
            pdf.setTextColor(...whiteColor)
            pdf.setFontSize(14)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Jel', 40, 12, { align: 'center' })
            pdf.setTextColor(...yellowColor)
            pdf.text('Sa', 47, 12, { align: 'center' })
            pdf.setTextColor(...whiteColor)
            pdf.text('Place', 55, 12, { align: 'center' })

            // Category badge
            pdf.setTextColor(...whiteColor)
            pdf.setFontSize(8)
            pdf.text(config.label.toUpperCase(), 40, 22, { align: 'center' })

            // Event Title
            pdf.setTextColor(...blackColor)
            pdf.setFontSize(12)
            pdf.setFont('helvetica', 'bold')
            const titleLines = pdf.splitTextToSize(title, 70)
            pdf.text(titleLines, 40, 45, { align: 'center' })

            // Divider line
            pdf.setDrawColor(...grayColor)
            pdf.setLineWidth(0.1)
            pdf.line(10, 55, 70, 55)

            // Event Details
            let yPos = 65
            pdf.setFontSize(9)
            
            // Date & Time
            pdf.setTextColor(...grayColor)
            pdf.setFont('helvetica', 'normal')
            pdf.text('DATE', 10, yPos)
            pdf.text('HEURE', 50, yPos)
            
            yPos += 5
            pdf.setTextColor(...blackColor)
            pdf.setFont('helvetica', 'bold')
            pdf.text(date, 10, yPos)
            pdf.text(time, 50, yPos)

            yPos += 10
            // Location
            pdf.setTextColor(...grayColor)
            pdf.setFont('helvetica', 'normal')
            pdf.text('LIEU', 10, yPos)
            yPos += 5
            pdf.setTextColor(...blackColor)
            pdf.setFont('helvetica', 'bold')
            const locationLines = pdf.splitTextToSize(location, 60)
            pdf.text(locationLines, 10, yPos)

            yPos += 10
            // Zone
            pdf.setTextColor(...grayColor)
            pdf.setFont('helvetica', 'normal')
            pdf.text('ZONE', 10, yPos)
            yPos += 5
            pdf.setTextColor(...greenColor)
            pdf.setFont('helvetica', 'bold')
            pdf.text(`${zoneConfig.icon} ${zoneConfig.label}`, 10, yPos)

            // Row & Seat
            if (row || seat) {
                yPos += 10
                pdf.setTextColor(...grayColor)
                pdf.setFont('helvetica', 'normal')
                if (row) pdf.text('RANGEE', 10, yPos)
                if (seat) pdf.text('SIEGE', 50, yPos)
                
                yPos += 5
                pdf.setTextColor(...blackColor)
                pdf.setFont('helvetica', 'bold')
                if (row) pdf.text(row, 10, yPos)
                if (seat) pdf.text(seat, 50, yPos)
            }

            // Divider
            yPos += 10
            pdf.setDrawColor(...grayColor)
            pdf.line(10, yPos, 70, yPos)

            // Ticket ID
            yPos += 8
            pdf.setTextColor(...grayColor)
            pdf.setFontSize(7)
            pdf.setFont('helvetica', 'normal')
            pdf.text('TICKET ID', 10, yPos)
            yPos += 4
            pdf.setTextColor(...blackColor)
            pdf.setFont('helvetica', 'bold')
            pdf.text(id, 10, yPos)

            // Holder
            if (holderName) {
                yPos += 6
                pdf.setTextColor(...grayColor)
                pdf.setFont('helvetica', 'normal')
                pdf.text('TITULAIRE', 10, yPos)
                yPos += 4
                pdf.setTextColor(...blackColor)
                pdf.setFont('helvetica', 'bold')
                pdf.text(holderName, 10, yPos)
            }

            // QR Code representation
            yPos += 10
            pdf.setFillColor(240, 240, 240)
            pdf.roundedRect(25, yPos, 30, 30, 2, 2, 'F')
            
            // QR placeholder text
            pdf.setTextColor(...blackColor)
            pdf.setFontSize(6)
            pdf.setFont('helvetica', 'normal')
            pdf.text('QR CODE', 40, yPos + 12, { align: 'center' })
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(5)
            pdf.text(qrValue.substring(0, 15) + '...', 40, yPos + 18, { align: 'center' })

            // Footer
            pdf.setFillColor(...blackColor)
            pdf.rect(0, 150, 80, 10, 'F')
            pdf.setTextColor(...whiteColor)
            pdf.setFontSize(10)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Jel', 35, 156, { align: 'center' })
            pdf.setTextColor(...yellowColor)
            pdf.text('Sa', 42, 156, { align: 'center' })
            pdf.setTextColor(...greenColor)
            pdf.text('Place', 49, 156, { align: 'center' })

            // Download the PDF
            pdf.save(`ticket-${id}.pdf`)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
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
                                className={`w-full py-4 rounded-xl bg-gradient-to-r ${config.gradient} text-white font-bold flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all`}
                            >
                                <Download className="w-5 h-5" />
                                Telecharger
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
