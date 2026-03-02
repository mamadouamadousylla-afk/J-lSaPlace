// Shared OTP Store for SMS verification
// In production, use Redis or database

export interface OTPData {
    otp: string
    expires: number
    firstName?: string
    lastName?: string
    password?: string
}

// In-memory store (resets on server restart)
export const otpStore = new Map<string, OTPData>()

// Generate a 6-digit OTP
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store OTP with 5-minute expiry
export function storeOTP(phone: string, otp: string, firstName?: string, lastName?: string, password?: string): void {
    const formattedPhone = phone.startsWith("+") ? phone : `+221${phone}`
    otpStore.set(formattedPhone, {
        otp,
        expires: Date.now() + 5 * 60 * 1000,
        firstName,
        lastName,
        password
    })
}

// Verify OTP
export function verifyOTP(phone: string, otp: string): { valid: boolean; data?: OTPData } {
    const formattedPhone = phone.startsWith("+") ? phone : `+221${phone}`
    const stored = otpStore.get(formattedPhone)
    
    if (!stored) {
        return { valid: false }
    }
    
    if (Date.now() > stored.expires) {
        otpStore.delete(formattedPhone)
        return { valid: false }
    }
    
    if (stored.otp !== otp) {
        return { valid: false }
    }
    
    // OTP is valid, remove it
    otpStore.delete(formattedPhone)
    
    return { valid: true, data: stored }
}
