export interface EventData {
    id: string
    title: string
    date: string
    time: string
    monthLabel: string
    category: string
    categoryId: string
    price: number
    location: string
    address: string
    imageUrl: string
    description: string
    tag: string
}

export const allEvents: EventData[] = [
    {
        id: "1",
        title: "Grand Gala de Lutte",
        date: "15 MARS - 16:00",
        time: "16h00 - 20h00",
        monthLabel: "MARS",
        category: "SPORT",
        categoryId: "sport",
        price: 5000,
        location: "Arene Nationale",
        address: "Pikine, Dakar",
        imageUrl: "/hero-combat.png",
        description: "Le combat royal le plus attendu de l annee.",
        tag: "Grand Combat"
    },
    {
        id: "2",
        title: "Dakar Music Festival",
        date: "22 MARS - 21:00",
        time: "21h00 - 04h00",
        monthLabel: "MARS",
        category: "MUSIQUE",
        categoryId: "musique",
        price: 25000,
        location: "Monument de la Renaissance",
        address: "Ouakam, Dakar",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
        description: "Vivez une nuit magique avec les plus grandes stars.",
        tag: "Festival"
    },
    {
        id: "3",
        title: "Soiree Stand-Up : Rire en Wolof",
        date: "28 MARS - 20:00",
        time: "20h00 - 23h00",
        monthLabel: "MARS",
        category: "HUMOUR",
        categoryId: "humour",
        price: 10000,
        location: "Theatre Daniel Sorano",
        address: "Plateau, Dakar",
        imageUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80",
        description: "Les meilleurs humoristes reunis pour une soiree de rires.",
        tag: "One Man Show"
    },
    {
        id: "4",
        title: "Soiree de Gala VIP",
        date: "05 AVRIL - 19:30",
        time: "19h30 - 23h30",
        monthLabel: "AVRIL",
        category: "LOISIRS",
        categoryId: "loisirs",
        price: 50000,
        location: "Hotel Terrou-Bi",
        address: "Corniche Ouest, Dakar",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        description: "Soiree d exception reunissant decideurs et personnalites.",
        tag: "Prestige"
    },
    {
        id: "5",
        title: "Forum Tech Dakar 2026",
        date: "12 AVRIL - 09:00",
        time: "09h00 - 18h00",
        monthLabel: "AVRIL",
        category: "CONFERENCE",
        categoryId: "conference",
        price: 15000,
        location: "CICAD",
        address: "Diamniadio, Dakar",
        imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
        description: "Le plus grand forum technologique de l Afrique de l Ouest.",
        tag: "Tech & Innovation"
    },
    {
        id: "6",
        title: "Marathon de Dakar",
        date: "20 AVRIL - 07:00",
        time: "07h00 - 14h00",
        monthLabel: "AVRIL",
        category: "SPORT",
        categoryId: "sport",
        price: 3000,
        location: "Place de l Independance",
        address: "Plateau, Dakar",
        imageUrl: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800&q=80",
        description: "Rejoignez des milliers de coureurs pour le marathon annuel.",
        tag: "Course"
    },
    {
        id: "7",
        title: "Nuit du Mbalax",
        date: "03 MAI - 22:00",
        time: "22h00 - 05h00",
        monthLabel: "MAI",
        category: "MUSIQUE",
        categoryId: "musique",
        price: 20000,
        location: "Grand Theatre National",
        address: "Corniche, Dakar",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
        description: "Nuit entiere dediee au Mbalax avec les plus grands artistes.",
        tag: "Concert Live"
    },
    {
        id: "8",
        title: "Comedy Club : Edition Speciale",
        date: "10 MAI - 20:30",
        time: "20h30 - 23h30",
        monthLabel: "MAI",
        category: "HUMOUR",
        categoryId: "humour",
        price: 8000,
        location: "Institut Francais",
        address: "Plateau, Dakar",
        imageUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&q=80",
        description: "Soiree d humour inoubliable avec des comediens locaux.",
        tag: "Comedy Club"
    },
    {
        id: "9",
        title: "Foire Internationale de Dakar",
        date: "17 MAI - 10:00",
        time: "10h00 - 22h00",
        monthLabel: "MAI",
        category: "LOISIRS",
        categoryId: "loisirs",
        price: 2000,
        location: "CICES",
        address: "Route de l Aeroport, Dakar",
        imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
        description: "La plus grande foire commerciale et culturelle du Senegal.",
        tag: "Foire"
    },
    {
        id: "10",
        title: "Conference Leadership Africain",
        date: "07 JUIN - 08:30",
        time: "08h30 - 17h00",
        monthLabel: "JUIN",
        category: "CONFERENCE",
        categoryId: "conference",
        price: 30000,
        location: "King Fahd Palace",
        address: "Corniche Ouest, Dakar",
        imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
        description: "Des leaders africains partagent leur vision de l avenir.",
        tag: "Leadership"
    },
    {
        id: "11",
        title: "Tournoi International de Lutte",
        date: "15 JUIN - 15:00",
        time: "15h00 - 21h00",
        monthLabel: "JUIN",
        category: "SPORT",
        categoryId: "sport",
        price: 10000,
        location: "Arene Nationale",
        address: "Pikine, Dakar",
        imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
        description: "Tournoi international reunissant les meilleurs lutteurs.",
        tag: "Tournoi"
    },
    {
        id: "12",
        title: "Festival Jazz de Saint-Louis",
        date: "21 JUIN - 19:00",
        time: "19h00 - 02h00",
        monthLabel: "JUIN",
        category: "MUSIQUE",
        categoryId: "musique",
        price: 15000,
        location: "Place Faidherbe",
        address: "Saint-Louis",
        imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80",
        description: "Le festival de jazz mythique de Saint-Louis.",
        tag: "Jazz Festival"
    },
]

export function getEventById(id: string): EventData | undefined {
    return allEvents.find(e => e.id === id)
}

export function getEventsByCategory(categoryId: string): EventData[] {
    if (categoryId === "all") return allEvents
    return allEvents.filter(e => e.categoryId === categoryId)
}

export function searchEvents(query: string): EventData[] {
    const lower = query.toLowerCase()
    return allEvents.filter(e =>
        e.title.toLowerCase().includes(lower) ||
        e.location.toLowerCase().includes(lower) ||
        e.category.toLowerCase().includes(lower) ||
        e.tag.toLowerCase().includes(lower)
    )
}
