"use client"

import * as React from "react"
import { Moon, Sun, Layout } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
    const { setTheme, theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-10 h-10 border border-border rounded-2xl bg-muted/20" />
    }

    const isDark = resolvedTheme === "dark"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-2xl border transition-all duration-500 group relative overflow-hidden ${isDark
                        ? "bg-card border-border hover:border-blue-500/50 hover:bg-card/80"
                        : "bg-background border-border hover:border-orange-400/50 hover:bg-orange-50"
                        }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 flex items-center justify-center">
                        {isDark ? (
                            <Moon className="h-[18px] w-[18px] text-blue-400 group-hover:rotate-12 transition-transform duration-500" />
                        ) : (
                            <Sun className="h-[18px] w-[18px] text-orange-500 group-hover:rotate-90 transition-transform duration-700" />
                        )}
                    </div>
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className={`min-w-[140px] rounded-2xl border p-1.5 shadow-2xl transition-all duration-500 ${isDark ? "bg-popover border-border" : "bg-popover border-border text-foreground"
                    }`}
            >
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${theme === "light"
                        ? "bg-orange-500/10 text-orange-600"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                        }`}
                >
                    <div className={`p-1 rounded-md transition-colors ${theme === "light" ? "bg-orange-500/20" : "bg-zinc-100"}`}>
                        <Sun className="h-3.5 w-3.5" />
                    </div>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${theme === "dark"
                        ? "bg-blue-500/10 text-blue-400"
                        : isDark ? "text-zinc-400 hover:bg-white/5 hover:text-white" : "text-zinc-500 hover:bg-zinc-100"
                        }`}
                >
                    <div className={`p-1 rounded-md transition-colors ${theme === "dark" ? "bg-blue-500/20" : "bg-zinc-800"}`}>
                        <Moon className="h-3.5 w-3.5" />
                    </div>
                    Dark
                </DropdownMenuItem>
                <div className={`my-1 h-px ${isDark ? "bg-white/5" : "bg-zinc-100"}`} />
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${theme === "system"
                        ? "bg-zinc-500/10 text-zinc-400"
                        : isDark ? "text-zinc-500 hover:bg-white/5" : "text-zinc-500 hover:bg-zinc-100"
                        }`}
                >
                    <div className={`p-1 rounded-md bg-zinc-100/10`}>
                        <Layout className="h-3.5 w-3.5" />
                    </div>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
