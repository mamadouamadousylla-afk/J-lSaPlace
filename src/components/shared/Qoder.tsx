"use client"

import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"

interface QoderProps {
    value: string
    size?: number
    bgColor?: string
    fgColor?: string
    className?: string
}

export default function Qoder({
    value,
    size = 200,
    bgColor = "#FFFFFF",
    fgColor = "#000000",
    className
}: QoderProps) {
    return (
        <div className={cn("p-4 bg-white rounded-xl shadow-sm", className)}>
            <QRCodeSVG
                value={value}
                size={size}
                bgColor={bgColor}
                fgColor={fgColor}
                level="H"
                includeMargin={false}
            />
        </div>
    )
}
