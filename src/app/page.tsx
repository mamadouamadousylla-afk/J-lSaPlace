"use client"

import { useState } from "react"
import Header from "@/components/layout/Header"
import Hero from "@/components/home/Hero"
import CategoryFilter from "@/components/home/CategoryFilter"
import TimelineEventList from "@/components/home/TimelineEventList"

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col gap-8 pb-12 bg-gray-50/50 min-h-screen">
      <Header onSearch={setSearchQuery} />
      {!searchQuery && selectedCategory === "all" && <Hero />}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat)
          setSearchQuery("")
        }}
      />
      <TimelineEventList
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
      />
    </div>
  )
}
