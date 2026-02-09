"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

import { Logo } from "./Logo"
import { Search, Shield, LogOut } from "lucide-react"
import { Button } from "./ui/button"
import { logout } from "@/app/auth-actions"
import { ModeToggle } from "./ModeToggle"

// ... imports

interface BoardLayoutProps {
    children: ReactNode
    title: string
    searchQuery?: string
    onSearchChange?: (val: string) => void
    logoText?: string
    currentView?: "board" | "timeline"
    onViewChange?: (view: "board" | "timeline") => void
}

export function BoardLayout({ children, title, searchQuery, onSearchChange, logoText, currentView = "board", onViewChange }: BoardLayoutProps) {
    return (
        <div className="h-full w-full relative flex flex-col bg-background text-foreground tracking-tight">
            {/* Dynamic Background Elements - Updated to blue accents */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transform-gpu">
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-blue-600/[0.03] blur-[60px]" />
                <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] rounded-full bg-blue-500/[0.03] blur-[60px]" />
            </div>

            {/* Board Header */}
            <header className="shrink-0 w-full h-auto min-h-[4rem] border-b border-border bg-background/80 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center px-4 lg:px-8 py-4 sm:py-0 justify-between z-10 gap-4">
                <div className="flex items-center gap-4 lg:gap-8 w-full sm:w-auto">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-foreground leading-none tracking-tight truncate max-w-[150px] sm:max-w-none">{title}</span>
                        <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest mt-0.5">{logoText || "Flowt"} • Active Project</span>
                    </div>

                    <div className="h-4 w-px bg-border hidden sm:block" />

                    <nav className="flex items-center gap-1 bg-accent/50 p-1 rounded-xl border border-border shadow-inner overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => onViewChange?.("board")}
                            className={`whitespace-nowrap px-4 lg:px-5 py-1.5 text-[11px] lg:text-[12px] font-bold rounded-lg transition-all uppercase tracking-wider ${currentView === "board" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                        >
                            Board
                        </button>
                        <button
                            onClick={() => onViewChange?.("timeline")}
                            className={`whitespace-nowrap px-4 lg:px-5 py-1.5 text-[11px] lg:text-[12px] font-bold rounded-lg transition-all uppercase tracking-wider ${currentView === "timeline" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                        >
                            Timeline
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-4 lg:gap-6 ml-auto sm:ml-0">
                    {/* Search Bar */}
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                        <input
                            placeholder="Search board..."
                            className="h-10 w-48 lg:w-64 rounded-xl bg-accent/50 border border-border pl-10 pr-4 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-background transition-all font-semibold placeholder:text-muted-foreground"
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                        />
                    </div>

                    <div className="h-4 w-px bg-border hidden sm:block" />

                    <div className="flex items-center gap-4">
                        <ModeToggle />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-10 w-full h-[calc(100vh-4rem)] p-4 overflow-x-auto overflow-y-hidden transform-gpu"
            >
                <div className="h-full flex gap-6 items-start">
                    {children}
                </div>
            </motion.main>
        </div>
    )
}
