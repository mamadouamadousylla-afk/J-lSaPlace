"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase"

interface SiteSettings {
    name: string
    email: string
    phone: string
    address: string
    logo_url: string
    facebook_url: string
    instagram_url: string
    twitter_url: string
}

interface PaymentSettings {
    wave_enabled: boolean
    orange_enabled: boolean
    free_enabled: boolean
    card_enabled: boolean
    fee_percentage: number
    min_amount: number
    max_amount: number
}

interface NotificationSettings {
    email_notifications: boolean
    sms_notifications: boolean
    push_notifications: boolean
    order_confirmation: boolean
    promotional: boolean
    event_reminders: boolean
}

interface SettingsContextType {
    site: SiteSettings
    payment: PaymentSettings
    notifications: NotificationSettings
    loading: boolean
    refreshSettings: () => Promise<void>
}

const defaultSiteSettings: SiteSettings = {
    name: "SunuLamb",
    email: "contact@sunulamb.sn",
    phone: "+221 77 123 45 67",
    address: "Dakar, Sénégal",
    logo_url: "/logo-sunulamb.png",
    facebook_url: "",
    instagram_url: "",
    twitter_url: ""
}

const defaultPaymentSettings: PaymentSettings = {
    wave_enabled: true,
    orange_enabled: true,
    free_enabled: true,
    card_enabled: false,
    fee_percentage: 3,
    min_amount: 500,
    max_amount: 1000000
}

const defaultNotificationSettings: NotificationSettings = {
    email_notifications: true,
    sms_notifications: true,
    push_notifications: false,
    order_confirmation: true,
    promotional: false,
    event_reminders: true
}

const SettingsContext = createContext<SettingsContextType>({
    site: defaultSiteSettings,
    payment: defaultPaymentSettings,
    notifications: defaultNotificationSettings,
    loading: true,
    refreshSettings: async () => {}
})

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [site, setSite] = useState<SiteSettings>(defaultSiteSettings)
    const [payment, setPayment] = useState<PaymentSettings>(defaultPaymentSettings)
    const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotificationSettings)
    const [loading, setLoading] = useState(true)

    const loadSettings = async () => {
        setLoading(true)
        
        try {
            const { data, error } = await supabase
                .from("settings")
                .select("setting_key, setting_value")

            if (error) {
                console.error("Error loading settings:", error.message || error)
                // Keep default values if table doesn't exist
            } else if (data && data.length > 0) {
                data.forEach((item: any) => {
                    const value = item.setting_value
                    switch (item.setting_key) {
                        case 'site':
                            setSite({
                                name: value.name || defaultSiteSettings.name,
                                email: value.email || defaultSiteSettings.email,
                                phone: value.phone || defaultSiteSettings.phone,
                                address: value.address || defaultSiteSettings.address,
                                logo_url: value.logo_url || defaultSiteSettings.logo_url,
                                facebook_url: value.facebook_url || "",
                                instagram_url: value.instagram_url || "",
                                twitter_url: value.twitter_url || ""
                            })
                            break
                        case 'payment':
                            setPayment({
                                wave_enabled: value.wave_enabled ?? defaultPaymentSettings.wave_enabled,
                                orange_enabled: value.orange_enabled ?? defaultPaymentSettings.orange_enabled,
                                free_enabled: value.free_enabled ?? defaultPaymentSettings.free_enabled,
                                card_enabled: value.card_enabled ?? defaultPaymentSettings.card_enabled,
                                fee_percentage: value.fee_percentage ?? defaultPaymentSettings.fee_percentage,
                                min_amount: value.min_amount ?? defaultPaymentSettings.min_amount,
                                max_amount: value.max_amount ?? defaultPaymentSettings.max_amount
                            })
                            break
                        case 'notifications':
                            setNotifications({
                                email_notifications: value.email_notifications ?? defaultNotificationSettings.email_notifications,
                                sms_notifications: value.sms_notifications ?? defaultNotificationSettings.sms_notifications,
                                push_notifications: value.push_notifications ?? defaultNotificationSettings.push_notifications,
                                order_confirmation: value.order_confirmation ?? defaultNotificationSettings.order_confirmation,
                                promotional: value.promotional ?? defaultNotificationSettings.promotional,
                                event_reminders: value.event_reminders ?? defaultNotificationSettings.event_reminders
                            })
                            break
                    }
                })
            }
        } catch (err) {
            console.error("Exception loading settings:", err)
            // Keep default values on error
        }
        
        setLoading(false)
    }

    useEffect(() => {
        loadSettings()

        // Subscribe to changes
        const channel = supabase
            .channel('settings-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
                loadSettings()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <SettingsContext.Provider value={{ site, payment, notifications, loading, refreshSettings: loadSettings }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider")
    }
    return context
}

// Hook for just site settings (most common use case)
export function useSiteSettings() {
    const { site, loading } = useSettings()
    return { site, loading }
}

// Hook for payment settings
export function usePaymentSettings() {
    const { payment, loading } = useSettings()
    return { payment, loading }
}
