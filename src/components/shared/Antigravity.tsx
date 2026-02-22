"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AntigravityProps {
    children: ReactNode
    className?: string
    delay?: number
    duration?: number
    yOffset?: number
}

export default function Antigravity({
    children,
    className,
    delay = 0,
    duration = 2,
    yOffset = 10
}: AntigravityProps) {
    return (
        <motion.div
            className={cn("inline-block", className)}
            animate={{
                y: [0, -yOffset, 0]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: delay
            }}
        >
            {children}
        </motion.div>
    )
}
