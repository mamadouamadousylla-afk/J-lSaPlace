import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(price)
}

// Fonction pour formater les nombres de manière cohérente (évite les erreurs d'hydratation)
export function formatNumber(num: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
  }).format(num)
}

// Helper to check if event has finished
export function isEventFinished(dateStr: string): boolean {
    if (!dateStr) return false;
    
    const months: Record<string, number> = {
        "janvier": 0, "jan": 0,
        "février": 1, "fevrier": 1, "fév": 1, "fev": 1,
        "mars": 2, "mar": 2,
        "avril": 3, "avr": 3,
        "mai": 4,
        "juin": 5,
        "juillet": 6, "jui": 6,
        "août": 7, "aout": 7, "aug": 7,
        "septembre": 8, "sep": 8,
        "octobre": 9, "oct": 9,
        "novembre": 10, "nov": 10,
        "décembre": 11, "dec": 11, "déc": 11
    };

    const parts = dateStr.toLowerCase().split('-');
    let day = 1;
    let month = 0;
    
    const datePart = parts[0].trim();
    const dateMatch = datePart.match(/(\d+)\s+([a-zûéè]+)/i);
    if (dateMatch) {
        day = parseInt(dateMatch[1]);
        const mStr = dateMatch[2];
        for (const [mName, mNum] of Object.entries(months)) {
            if (mStr.includes(mName)) {
                month = mNum;
                break;
            }
        }
    } else {
        return false; 
    }

    let hours = 23;
    let minutes = 59;
    
    if (parts.length > 1) {
        const timePart = parts[1].trim();
        const timeMatch = timePart.match(/(\d+)[h:](\d+)/i);
        if (timeMatch) {
            hours = parseInt(timeMatch[1]);
            minutes = parseInt(timeMatch[2]);
        }
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    
    let eventYear = currentYear;
    // Si on est en fin d'année (Oct-Dec) et que l'événement est en début d'année (Jan-Mar), 
    // c'est probablement pour l'année prochaine.
    if (now.getMonth() >= 9 && month <= 2) { 
        eventYear = currentYear + 1;
    }

    const eventDate = new Date(eventYear, month, day, hours, minutes);
    return now > eventDate;
}
