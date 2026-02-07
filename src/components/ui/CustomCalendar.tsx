"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    isToday,
    startOfDay
} from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CustomCalendarProps {
    selected?: Date
    onSelect?: (date: Date) => void
    className?: string
}

export function CustomCalendar({ selected, onSelect, className }: CustomCalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(selected ? startOfMonth(selected) : startOfMonth(new Date()))
    const [direction, setDirection] = React.useState(0)

    const nextMonth = () => {
        setDirection(1)
        setCurrentMonth(prev => addMonths(prev, 1))
    }

    const prevMonth = () => {
        setDirection(-1)
        setCurrentMonth(prev => subMonths(prev, 1))
    }

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)

    // Always show exactly 42 days (6 full weeks) to prevent height jumping
    const calendarDays = Array.from({ length: 42 }).map((_, i) => addDays(startDate, i))

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const variants = {
        initial: (direction: number) => ({
            x: direction > 0 ? 30 : -30,
            opacity: 0,
            scale: 0.98
        }),
        animate: {
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -30 : 30,
            opacity: 0,
            scale: 0.98
        })
    }

    return (
        <div className={cn("w-[300px] bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl select-none transform-gpu", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5">
                <button
                    onClick={prevMonth}
                    className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all active:scale-90"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-sm font-black text-white tracking-tight uppercase">
                        {format(currentMonth, "MMMM")}
                    </span>
                    <span className="text-[10px] font-black text-blue-500/80 uppercase tracking-[0.2em] leading-none mt-1">
                        {format(currentMonth, "yyyy")}
                    </span>
                </div>

                <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all active:scale-90"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 px-4 pb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center">
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                            {day.charAt(0)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Days Grid - Fixed Height Container */}
            <div className="px-4 pb-6 relative h-[250px] overflow-hidden">
                <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                    <motion.div
                        key={currentMonth.toString()}
                        custom={direction}
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="grid grid-cols-7 gap-1.5"
                    >
                        {calendarDays.map((day) => {
                            const isSelected = selected && isSameDay(day, selected)
                            const isCurrentMonth = isSameMonth(day, monthStart)
                            const isTodayDate = isToday(day)

                            return (
                                <button
                                    key={day.toString()}
                                    onClick={() => onSelect?.(day)}
                                    className={cn(
                                        "h-9 w-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all relative group transform-gpu",
                                        !isCurrentMonth && "text-zinc-800",
                                        isCurrentMonth && "text-zinc-400 hover:text-white hover:bg-white/5",
                                        isSelected && "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/20",
                                        isTodayDate && !isSelected && "border border-blue-500/30 text-blue-400"
                                    )}
                                >
                                    {format(day, "d")}
                                    {isTodayDate && !isSelected && (
                                        <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-blue-500" />
                                    )}
                                </button>
                            )
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer / Quick Actions */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                <button
                    onClick={() => {
                        const today = startOfDay(new Date())
                        setCurrentMonth(startOfMonth(today))
                        onSelect?.(today)
                    }}
                    className="text-[10px] font-black text-zinc-500 hover:text-blue-400 uppercase tracking-widest transition-colors"
                >
                    Target Today
                </button>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
            </div>
        </div>
    )
}
