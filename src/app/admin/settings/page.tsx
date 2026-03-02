"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { 
    Settings, Save, Bell, CreditCard, Shield, Globe, Mail, Phone, 
    Percent, ToggleLeft, ToggleRight, CheckCircle, AlertCircle, 
    Camera, RefreshCw, Eye, EyeOff, Database, Server, Upload, X, ImagePlus, Trash2
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface SiteSettings {
    site_name: string
    contact_email: string
    contact_phone: string
    address: string
    facebook_url: string
    instagram_url: string
    twitter_url: string
    logo_url: string
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

// Helper to sanitize file names
function sanitizeFileName(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.')
    const extension = lastDotIndex !== -1 ? fileName.slice(lastDotIndex) : ''
    const nameWithoutExt = lastDotIndex !== -1 ? fileName.slice(0, lastDotIndex) : fileName
    const sanitizedName = nameWithoutExt
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 50)
    const timestamp = Date.now()
    return `${sanitizedName}_${timestamp}${extension}`
}

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState("general")
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Settings state
    const [siteSettings, setSiteSettings] = useState<SiteSettings>({
        site_name: "SunuLamb",
        contact_email: "contact@sunulamb.sn",
        contact_phone: "+221 77 123 45 67",
        address: "Dakar, Sénégal",
        facebook_url: "https://facebook.com/sunulamb",
        instagram_url: "https://instagram.com/sunulamb",
        twitter_url: "https://twitter.com/sunulamb",
        logo_url: "/logo-sunulamb.png"
    })

    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
        wave_enabled: true,
        orange_enabled: true,
        free_enabled: true,
        card_enabled: false,
        fee_percentage: 3,
        min_amount: 500,
        max_amount: 1000000
    })

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        email_notifications: true,
        sms_notifications: true,
        push_notifications: false,
        order_confirmation: true,
        promotional: false,
        event_reminders: true
    })

    const [securitySettings, setSecuritySettings] = useState({
        two_factor_enabled: false,
        session_timeout: 30,
        login_attempts: 5
    })

    // Load settings from Supabase on mount
    useEffect(() => {
        loadSettings()
    }, [])

    async function loadSettings() {
        setInitialLoading(true)
        
        try {
            const { data, error } = await supabase
                .from("settings")
                .select("setting_key, setting_value")

            if (error) {
                console.error("Error loading settings:", error)
            } else if (data) {
                data.forEach((item: any) => {
                    const value = item.setting_value
                    switch (item.setting_key) {
                        case 'site':
                            setSiteSettings({
                                site_name: value.name || "SunuLamb",
                                contact_email: value.email || "",
                                contact_phone: value.phone || "",
                                address: value.address || "",
                                facebook_url: value.facebook_url || "",
                                instagram_url: value.instagram_url || "",
                                twitter_url: value.twitter_url || "",
                                logo_url: value.logo_url || "/logo-sunulamb.png"
                            })
                            break
                        case 'payment':
                            setPaymentSettings({
                                wave_enabled: value.wave_enabled ?? true,
                                orange_enabled: value.orange_enabled ?? true,
                                free_enabled: value.free_enabled ?? true,
                                card_enabled: value.card_enabled ?? false,
                                fee_percentage: value.fee_percentage ?? 3,
                                min_amount: value.min_amount ?? 500,
                                max_amount: value.max_amount ?? 1000000
                            })
                            break
                        case 'notifications':
                            setNotificationSettings({
                                email_notifications: value.email_notifications ?? true,
                                sms_notifications: value.sms_notifications ?? true,
                                push_notifications: value.push_notifications ?? false,
                                order_confirmation: value.order_confirmation ?? true,
                                promotional: value.promotional ?? false,
                                event_reminders: value.event_reminders ?? true
                            })
                            break
                        case 'security':
                            setSecuritySettings({
                                two_factor_enabled: value.two_factor_enabled ?? false,
                                session_timeout: value.session_timeout ?? 30,
                                login_attempts: value.login_attempts ?? 5
                            })
                            break
                    }
                })
            }
        } catch (err) {
            console.error("Exception loading settings:", err)
        }
        
        setInitialLoading(false)
    }

    // Show toast
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
    }

    // Handle logo upload
    async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
        if (!validTypes.includes(file.type)) {
            showToast("Format non supporté. Utilisez PNG, SVG ou JPG.", "error")
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast("Le fichier est trop volumineux. Max 2MB.", "error")
            return
        }

        setUploadingLogo(true)

        try {
            const sanitizedFileName = sanitizeFileName(file.name)
            const filePath = `logos/${sanitizedFileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('event-images')
                .upload(filePath, file, { upsert: true })

            if (uploadError) {
                console.error("Upload error:", uploadError)
                showToast("Erreur lors du téléchargement", "error")
                setUploadingLogo(false)
                return
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('event-images')
                .getPublicUrl(filePath)

            const publicUrl = urlData.publicUrl

            // Update state
            setSiteSettings({ ...siteSettings, logo_url: publicUrl })
            
            // Save to database immediately
            await saveSettingToDb('site', { ...siteSettings, logo_url: publicUrl })
            
            showToast("Logo mis à jour avec succès!")

        } catch (error) {
            console.error("Error:", error)
            showToast("Erreur lors du téléchargement", "error")
        }

        setUploadingLogo(false)
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Remove logo
    async function removeLogo() {
        const newSettings = { ...siteSettings, logo_url: "" }
        setSiteSettings(newSettings)
        
        try {
            await saveSettingToDb('site', {
                name: newSettings.site_name,
                email: newSettings.contact_email,
                phone: newSettings.contact_phone,
                address: newSettings.address,
                facebook_url: newSettings.facebook_url,
                instagram_url: newSettings.instagram_url,
                twitter_url: newSettings.twitter_url,
                logo_url: ""
            })
            showToast("Logo supprimé")
        } catch (error) {
            showToast("Erreur: la table settings n'existe pas. Exécutez le SQL dans Supabase.", "error")
        }
    }

    // Save a single setting to database
    async function saveSettingToDb(key: string, value: any) {
        try {
            const { error } = await supabase
                .from("settings")
                .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' })
            
            if (error) {
                console.error(`Error saving ${key}:`, error.message || error)
                throw error
            }
        } catch (err: any) {
            console.error(`Exception saving ${key}:`, err)
            throw err
        }
    }

    // Save all settings
    async function saveSettings() {
        setLoading(true)
        
        try {
            // Save site settings
            await saveSettingToDb('site', {
                name: siteSettings.site_name,
                email: siteSettings.contact_email,
                phone: siteSettings.contact_phone,
                address: siteSettings.address,
                facebook_url: siteSettings.facebook_url,
                instagram_url: siteSettings.instagram_url,
                twitter_url: siteSettings.twitter_url,
                logo_url: siteSettings.logo_url
            })

            // Save payment settings
            await saveSettingToDb('payment', paymentSettings)

            // Save notification settings
            await saveSettingToDb('notifications', notificationSettings)

            // Save security settings
            await saveSettingToDb('security', securitySettings)
            
            showToast("Paramètres enregistrés avec succès!")
        } catch (error: any) {
            console.error("Save settings error:", error)
            showToast("Erreur: exécutez d'abord le SQL dans Supabase pour créer la table settings", "error")
        }
        
        setLoading(false)
    }

    // Toggle component
    const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
        <button
            onClick={onChange}
            className="relative focus:outline-none"
        >
            {enabled ? (
                <ToggleRight className="w-10 h-6 text-primary" />
            ) : (
                <ToggleLeft className="w-10 h-6 text-gray-300" />
            )}
        </button>
    )

    // Tab configuration
    const tabs = [
        { id: "general", label: "Général", icon: Globe },
        { id: "payment", label: "Paiements", icon: CreditCard },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Sécurité", icon: Shield },
        { id: "system", label: "Système", icon: Server }
    ]

    return (
        <div className="space-y-8">
            {/* Toast Notification */}
            {toast.show && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                        "fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2",
                        toast.type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white"
                    )}
                >
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {toast.message}
                </motion.div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-poppins font-bold text-gray-900">Paramètres</h1>
                    <p className="text-gray-500 mt-1">Configurez votre plateforme SunuLamb</p>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={loading}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Enregistrer
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2",
                                activeTab === tab.id
                                    ? "text-primary border-primary bg-primary/5"
                                    : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {/* General Settings */}
                    {activeTab === "general" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            {/* Logo Section */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ImagePlus className="w-5 h-5 text-primary" />
                                    Logo de la plateforme
                                </h3>
                                
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                    {/* Logo Preview */}
                                    <div className="relative group">
                                        <div 
                                            className={cn(
                                                "w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-white",
                                                siteSettings.logo_url ? "border-primary/30" : "border-gray-300"
                                            )}
                                        >
                                            {siteSettings.logo_url ? (
                                                <img 
                                                    src={siteSettings.logo_url} 
                                                    alt="Logo" 
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center text-gray-400">
                                                    <ImagePlus className="w-8 h-8" />
                                                    <span className="text-xs mt-1">Aucun logo</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-3">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                        
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingLogo}
                                                className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 flex items-center gap-2 transition-colors disabled:opacity-50"
                                            >
                                                {uploadingLogo ? (
                                                    <>
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                        Chargement...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4" />
                                                        Télécharger
                                                    </>
                                                )}
                                            </button>
                                            
                                            {siteSettings.logo_url && (
                                                <button
                                                    onClick={removeLogo}
                                                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Supprimer
                                                </button>
                                            )}
                                        </div>
                                        
                                        <p className="text-xs text-gray-500">
                                            Taille recommandée: 512×512px. PNG, SVG ou JPG. Max 2MB.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                        Informations du site
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom du site
                                            </label>
                                            <input
                                                type="text"
                                                value={siteSettings.site_name}
                                                onChange={(e) => setSiteSettings({...siteSettings, site_name: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Mail className="w-4 h-4 inline mr-2" />
                                                Email de contact
                                            </label>
                                            <input
                                                type="email"
                                                value={siteSettings.contact_email}
                                                onChange={(e) => setSiteSettings({...siteSettings, contact_email: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Phone className="w-4 h-4 inline mr-2" />
                                                Téléphone
                                            </label>
                                            <input
                                                type="text"
                                                value={siteSettings.contact_phone}
                                                onChange={(e) => setSiteSettings({...siteSettings, contact_phone: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Adresse
                                            </label>
                                            <input
                                                type="text"
                                                value={siteSettings.address}
                                                onChange={(e) => setSiteSettings({...siteSettings, address: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                        Réseaux sociaux
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Facebook
                                            </label>
                                            <input
                                                type="url"
                                                value={siteSettings.facebook_url}
                                                onChange={(e) => setSiteSettings({...siteSettings, facebook_url: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="https://facebook.com/..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Instagram
                                            </label>
                                            <input
                                                type="url"
                                                value={siteSettings.instagram_url}
                                                onChange={(e) => setSiteSettings({...siteSettings, instagram_url: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="https://instagram.com/..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Twitter / X
                                            </label>
                                            <input
                                                type="url"
                                                value={siteSettings.twitter_url}
                                                onChange={(e) => setSiteSettings({...siteSettings, twitter_url: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="https://twitter.com/..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Payment Settings */}
                    {activeTab === "payment" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                Méthodes de paiement
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { key: 'wave_enabled', label: 'Wave', icon: '📱', color: 'blue' },
                                    { key: 'orange_enabled', label: 'Orange Money', icon: '🟠', color: 'orange' },
                                    { key: 'free_enabled', label: 'Free Money', icon: '💛', color: 'yellow' },
                                    { key: 'card_enabled', label: 'Carte Bancaire', icon: '💳', color: 'purple' }
                                ].map((method) => (
                                    <div
                                        key={method.key}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{method.icon}</span>
                                            <span className="font-bold text-gray-900">{method.label}</span>
                                        </div>
                                        <Toggle
                                            enabled={paymentSettings[method.key as keyof PaymentSettings] as boolean}
                                            onChange={() => setPaymentSettings({
                                                ...paymentSettings,
                                                [method.key]: !paymentSettings[method.key as keyof PaymentSettings]
                                            })}
                                        />
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 pt-6">
                                Frais et limites
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Percent className="w-4 h-4 inline mr-2" />
                                        Commission (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={paymentSettings.fee_percentage}
                                        onChange={(e) => setPaymentSettings({...paymentSettings, fee_percentage: Number(e.target.value)})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        min="0"
                                        max="100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Montant minimum (FCFA)
                                    </label>
                                    <input
                                        type="number"
                                        value={paymentSettings.min_amount}
                                        onChange={(e) => setPaymentSettings({...paymentSettings, min_amount: Number(e.target.value)})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Montant maximum (FCFA)
                                    </label>
                                    <input
                                        type="number"
                                        value={paymentSettings.max_amount}
                                        onChange={(e) => setPaymentSettings({...paymentSettings, max_amount: Number(e.target.value)})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === "notifications" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                Canaux de notification
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { key: 'email_notifications', label: 'Notifications par email', desc: 'Recevoir les alertes par email' },
                                    { key: 'sms_notifications', label: 'Notifications par SMS', desc: 'Recevoir les alertes par SMS' },
                                    { key: 'push_notifications', label: 'Push notifications', desc: 'Notifications push sur mobile' }
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-900">{item.label}</p>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                        <Toggle
                                            enabled={notificationSettings[item.key as keyof NotificationSettings] as boolean}
                                            onChange={() => setNotificationSettings({
                                                ...notificationSettings,
                                                [item.key]: !notificationSettings[item.key as keyof NotificationSettings]
                                            })}
                                        />
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 pt-6">
                                Types de notifications
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { key: 'order_confirmation', label: 'Confirmation de commande', desc: 'Quand un utilisateur achète un ticket' },
                                    { key: 'event_reminders', label: 'Rappels d\'événements', desc: '24h avant chaque événement' },
                                    { key: 'promotional', label: 'Emails promotionnels', desc: 'Offres spéciales et nouveautés' }
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-900">{item.label}</p>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                        <Toggle
                                            enabled={notificationSettings[item.key as keyof NotificationSettings] as boolean}
                                            onChange={() => setNotificationSettings({
                                                ...notificationSettings,
                                                [item.key]: !notificationSettings[item.key as keyof NotificationSettings]
                                            })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Security Settings */}
                    {activeTab === "security" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                Authentification
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div>
                                        <p className="font-bold text-gray-900">Authentification à deux facteurs</p>
                                        <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
                                    </div>
                                    <Toggle
                                        enabled={securitySettings.two_factor_enabled}
                                        onChange={() => setSecuritySettings({
                                            ...securitySettings,
                                            two_factor_enabled: !securitySettings.two_factor_enabled
                                        })}
                                    />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 pt-6">
                                Sessions
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Délai d'expiration de session (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={securitySettings.session_timeout}
                                        onChange={(e) => setSecuritySettings({...securitySettings, session_timeout: Number(e.target.value)})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        min="5"
                                        max="120"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tentatives de connexion max
                                    </label>
                                    <input
                                        type="number"
                                        value={securitySettings.login_attempts}
                                        onChange={(e) => setSecuritySettings({...securitySettings, login_attempts: Number(e.target.value)})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        min="3"
                                        max="10"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-yellow-800">Conseil de sécurité</p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Activez l'authentification à deux facteurs et utilisez des mots de passe forts pour protéger votre compte administrateur.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* System Settings */}
                    {activeTab === "system" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                État du système
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Database className="w-5 h-5 text-blue-600" />
                                        <span className="font-bold text-gray-900">Base de données</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm text-green-600 font-medium">Opérationnel</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Server className="w-5 h-5 text-purple-600" />
                                        <span className="font-bold text-gray-900">Serveur</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm text-green-600 font-medium">Opérationnel</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CreditCard className="w-5 h-5 text-green-600" />
                                        <span className="font-bold text-gray-900">Paiements</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm text-green-600 font-medium">Opérationnel</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 pt-6">
                                Actions système
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left hover:bg-gray-100 transition-colors group"
                                >
                                    <p className="font-bold text-gray-900 group-hover:text-primary">Vider le cache</p>
                                    <p className="text-sm text-gray-500 mt-1">Libérer l'espace cache du système</p>
                                </button>

                                <button
                                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left hover:bg-gray-100 transition-colors group"
                                >
                                    <p className="font-bold text-gray-900 group-hover:text-primary">Exporter les données</p>
                                    <p className="text-sm text-gray-500 mt-1">Télécharger une sauvegarde complète</p>
                                </button>

                                <button
                                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left hover:bg-gray-100 transition-colors group"
                                >
                                    <p className="font-bold text-gray-900 group-hover:text-primary">Logs système</p>
                                    <p className="text-sm text-gray-500 mt-1">Voir les journaux d'activité</p>
                                </button>

                                <button
                                    className="p-4 bg-red-50 rounded-xl border border-red-200 text-left hover:bg-red-100 transition-colors group"
                                >
                                    <p className="font-bold text-red-700">Mode maintenance</p>
                                    <p className="text-sm text-red-600 mt-1">Désactiver temporairement le site</p>
                                </button>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-sm text-blue-800">
                                    <strong>Version:</strong> SunuLamb v1.0.0 | 
                                    <strong className="ml-4">Dernière mise à jour:</strong> {new Date().toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}
