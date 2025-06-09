
"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])  // Track if scrolling was initiated by clicking a nav item
  const [isNavScrolling, setIsNavScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<number | null>(null);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout !== null) {
        window.clearTimeout(scrollTimeout);
      }
    };
  }, [scrollTimeout]);

  // Scroll-based active tab detection
  useEffect(() => {
    const handleScroll = () => {
      // Skip scroll detection if currently animating from click
      if (isNavScrolling) return;

      const scrollPosition = window.scrollY + 100 // Offset for header

      // Find which section is currently in view
      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.querySelector(items[i].url)
        if (element) {
          const elementTop = element.getBoundingClientRect().top + window.scrollY
          if (scrollPosition >= elementTop) {
            setActiveTab(items[i].name)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Call once to set initial state

    return () => window.removeEventListener("scroll", handleScroll)
  }, [items, isNavScrolling])

  const handleNavClick = (item: NavItem) => {
    // Immediately set active tab for instant feedback
    setActiveTab(item.name)
    
    // Set flag to ignore scroll events during animation
    setIsNavScrolling(true)
    
    // Clear any existing timeout
    if (scrollTimeout !== null) {
      window.clearTimeout(scrollTimeout);
    }
    
    // Smooth scroll to section
    const element = document.querySelector(item.url)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      
      // Reset flag after animation completes (typical smooth scroll takes ~500-1000ms)
      const timeout = window.setTimeout(() => {
        setIsNavScrolling(false);
      }, 1000);
      
      setScrollTimeout(timeout);
    }
  }
  return (    <nav
      className={cn(
        "fixed bottom-0 md:top-0 left-1/2 -translate-x-1/2 z-50 mb-4 sm:mb-6 md:pt-16 lg:pt-6 pointer-events-none",
        className,
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3 bg-black/20 border border-gray-700 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg pointer-events-auto">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <button
              key={item.name}
              onClick={() => handleNavClick(item)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-3 sm:px-4 md:px-6 py-2 rounded-full transition-colors",
                "text-gray-300 hover:text-white",
                isActive && "bg-gray-800/50 text-white",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>{isActive && (                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-gradient-to-r from-blue-100/10 via-blue-200/10 to-purple-200/10 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 35,
                    mass: 0.8,
                  }}
                >                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 rounded-t-full">
                    <div className="absolute w-12 h-6 bg-blue-100/30 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-blue-200/30 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-purple-200/30 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
