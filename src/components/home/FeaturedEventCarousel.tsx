"use client"

import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function FeaturedEventCarousel() {
  // Liste des événements phares
  const featuredEvents = [
    {
      id: "1",
      title: "Modou Lô vs Sa Thiès",
      date: "Dimanche, 5 Avril",
      location: "Arène Nationale, Dakar",
      price: 5000,
      imageUrl: "/hero-combat.png",
    },
    {
      id: "2",
      title: "Eumeu Sène vs Ada Fass",
      date: "Dimanche, 19 Avril 2026",
      location: "Arène Nationale, Dakar",
      price: 3000,
      imageUrl: "/eumeu-ada.jpg",
    },
    {
      id: "3",
      title: "Reug Reug vs Bombardier",
      date: "Samedi, 4 Janvier",
      location: "Grand Stade de Mbour",
      price: 2500,
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
    }
  ];

  // Configuration du carrousel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        }
      }
    ]
  };

  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-poppins font-bold text-gray-900">Événements Phares</h2>
        <button className="text-secondary font-bold text-sm">Voir tout</button>
      </div>
      
      <Slider {...settings}>
        {featuredEvents.map((event) => (
          <div key={event.id} className="px-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-3xl overflow-hidden shadow-xl cursor-pointer"
              onClick={() => window.location.href = `/evenements/${event.id}`}
            >
              <div className="relative h-80">
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // En cas d'erreur de chargement, afficher une image par défaut
                    e.currentTarget.src = "/file.svg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Badge Événement Phare */}
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold uppercase tracking-wider">
                    Événement Phare
                  </span>
                </div>
                
                {/* Contenu superposé */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-poppins font-bold">{event.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <p className="text-sm opacity-90">{event.date}</p>
                      <p className="text-xs opacity-75">{event.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{event.price} FCFA</p>
                      <button className="flex items-center text-xs font-bold mt-1">
                        Acheter <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </Slider>
    </div>
  );
}