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
