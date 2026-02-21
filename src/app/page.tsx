"use client"

import Hero from "@/components/home/Hero"
import EventCard from "@/components/shared/EventCard"
import { motion } from "framer-motion"
import { Users, ShieldCheck, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const upcomingEvents = [
  {
    id: "1",
    title: "Modou Lô vs Sa Thiès",
    date: "Dimanche, 5 Avril",
    location: "Arène Nationale, Dakar",
    price: 5000,
    imageUrl: "/hero-combat.png",
    status: "disponible" as const
  },
  {
    id: "2",
    title: "Eumeu Sène vs Ada Fass",
    date: "Dimanche, 19 Avril 2026",
    location: "Arène Nationale, Dakar",
    price: 3000,
    imageUrl: "/eumeu-ada.jpg",
    status: "disponible" as const
  },
  {
    id: "3",
    title: "Reug Reug vs Bombardier",
    date: "Samedi, 4 Janvier",
    location: "Grand Stade de Mbour",
    price: 2500,
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
    status: "disponible" as const
  }
]

const steps = [
  {
    title: "Choisis ton combat",
    desc: "Parcourez les événements et trouvez vos lutteurs préférés.",
    icon: Users,
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "Paiement Mobile",
    desc: "Payez en toute sécurité avec Wave, Orange Money ou Free.",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600"
  },
  {
    title: "Reçois ton QR Code",
    desc: "Votre ticket est généré instantanément sur votre téléphone.",
    icon: ShieldCheck,
    color: "bg-green-100 text-green-600"
  }
]

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      <Hero />

      {/* Upcoming Events */}
      <section className="px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-poppins font-bold text-gray-900">Événements à venir</h2>
          <button className="text-secondary font-bold text-sm">Voir tout</button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
          {upcomingEvents.map((event) => (
            <div key={event.id} onClick={() => window.location.href = `/evenements/${event.id}`} className="cursor-pointer transition-transform active:scale-95">
              <EventCard {...event} />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-[3rem] mx-4 space-y-10 shadow-sm">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-poppins font-bold text-gray-900">Comment ça marche ?</h2>
          <p className="text-gray-500 text-sm">Votre ticket en 3 étapes simples</p>
        </div>

        <div className="grid gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex items-start gap-4 p-4 rounded-3xl bg-white shadow-sm border border-gray-100"
            >
              <div className={cn("p-4 rounded-2xl", step.color)}>
                <step.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Wrestlers */}
      <section className="px-6 space-y-6">
        <h2 className="text-2xl font-poppins font-bold text-center text-gray-900">Les Rois de l&apos;Arène</h2>
        <div className="grid grid-cols-2 gap-4">
          {["Modou Lô", "Sa Thiès", "Balla Gaye 2", "Eumeu Sène"].map((name, idx) => (
            <motion.div
              key={name}
              whileTap={{ scale: 0.95 }}
              className="relative aspect-square rounded-[2rem] overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors" />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-bold text-center">{name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gamified Banner */}
      <section className="px-6">
        <div className="bg-gradient-to-r from-primary to-secondary p-8 rounded-[2.5rem] text-white space-y-4">
          <h3 className="text-xl font-poppins font-bold italic">Sunu Lamb, Sunu Fierté !</h3>
          <p className="text-white/80 text-sm">Parrainez un ami et gagnez 500 FCFA sur votre prochain ticket.</p>
          <button className="px-6 py-2 bg-white text-primary rounded-full font-bold text-sm shadow-xl">
            Inviter un ami
          </button>
        </div>
      </section>
    </div>
  )
}
