"use client"

import { useState } from "react"
import Link from "next/link"
import { isToday, isTomorrow, isThisWeek, isThisMonth } from "date-fns"

export function UpcomingTasks({ tasks }: { tasks: any[] }) {
    // Sliders: Day | Week | Month
    const [filter, setFilter] = useState<"day" | "week" | "month">("month")

    const filteredTasks = tasks.filter(task => {
        if (!task.dueDate) return false
        const date = new Date(task.dueDate)
        if (filter === "day") return isToday(date) || isTomorrow(date) // "Day" usually implies urgent/next 24h
        if (filter === "week") return isThisWeek(date)
        if (filter === "month") return isThisMonth(date)
        return true
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground tracking-tight">Upcoming</h2>
                <div className="flex bg-muted p-1 rounded-lg">
                    {(["day", "week", "month"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filteredTasks.length > 0 ? filteredTasks.slice(0, 5).map((task: any) => (
                    <Link href={`/board/${task.column.boardId}`} key={task.id} className="block group">
                        <div className="p-4 rounded-2xl bg-card border border-border hover:border-red-500/30 hover:bg-red-500/[0.02] transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-red-500/[0.02] rounded-bl-3xl pointer-events-none" />
                            <div className="text-xs font-bold text-red-500/80 mb-1 uppercase tracking-wider">
                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="font-bold text-foreground group-hover:text-red-500 transition-colors truncate">{task.title}</div>
                            <div className="text-[10px] font-bold text-muted-foreground mt-2 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span> {task.column.board.title}
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div className="text-xs font-medium text-muted-foreground italic py-4 text-center bg-card rounded-xl border border-dashed border-border">
                        No tasks for this {filter}
                    </div>
                )}
            </div>
        </div>
    )
}
