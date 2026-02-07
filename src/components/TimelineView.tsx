"use client"

import { useMemo } from "react"
import { Calendar, CheckSquare, Clock, User } from "lucide-react"
import { format, isToday, isTomorrow, isPast, isFuture, startOfDay } from "date-fns"
import { TaskCard } from "./TaskCard"
import type { Task } from "@prisma/client" // Simplification
import Link from "next/link"

interface TimelineViewProps {
    board: any
    onTaskClick: (task: any) => void
}

export function TimelineView({ board, onTaskClick }: TimelineViewProps) {
    // Flatten tasks and filtering
    const allTasks = useMemo(() => {
        const tasks: any[] = []
        board.columns.forEach((col: any) => {
            tasks.push(...col.tasks.map((t: any) => ({ ...t, columnTitle: col.title })))
        })
        return tasks.sort((a, b) => {
            // Sort by due date (nulls last), then by completion status
            if (!a.dueDate && !b.dueDate) return 0
            if (!a.dueDate) return 1
            if (!b.dueDate) return -1
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
    }, [board])

    const groupedTasks = useMemo(() => {
        const groups: { title: string; tasks: any[]; isLate?: boolean }[] = []

        const noDate: any[] = []
        const late: any[] = []
        const today: any[] = []
        const tomorrow: any[] = []
        const upcoming: any[] = []
        const completed: any[] = []

        allTasks.forEach(task => {
            if (task.columnTitle === "Done" || task.isCompleted) {
                completed.push(task)
                return
            }

            if (!task.dueDate) {
                noDate.push(task)
                return
            }

            const date = new Date(task.dueDate)
            if (isPast(date) && !isToday(date)) {
                late.push(task)
            } else if (isToday(date)) {
                today.push(task)
            } else if (isTomorrow(date)) {
                tomorrow.push(task)
            } else {
                upcoming.push(task)
            }
        })

        if (late.length > 0) groups.push({ title: "Overdue", tasks: late, isLate: true })
        if (today.length > 0) groups.push({ title: "Today", tasks: today })
        if (tomorrow.length > 0) groups.push({ title: "Tomorrow", tasks: tomorrow })
        if (upcoming.length > 0) groups.push({ title: "Upcoming", tasks: upcoming })
        if (noDate.length > 0) groups.push({ title: "No Date", tasks: noDate })
        if (completed.length > 0) groups.push({ title: "Completed", tasks: completed })

        return groups
    }, [allTasks])

    return (
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 lg:p-10 pb-20 bg-background text-foreground">
            <div className="max-w-4xl mx-auto relative pl-8 border-l border-border space-y-12">
                {groupedTasks.map((group, groupIndex) => (
                    <div key={group.title} className="relative">
                        {/* Group Marker */}
                        <div className={`absolute -left-[39px] flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-background ${group.isLate ? "bg-red-500" : "bg-blue-600"}`}>
                            <div className="w-2 h-2 rounded-full bg-white" />
                        </div>

                        <div className="mb-6">
                            <h3 className={`text-lg font-bold ${group.isLate ? "text-red-400" : "text-foreground"}`}>{group.title}</h3>
                            <div className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{group.tasks.length} Tasks</div>
                        </div>

                        <div className="space-y-3">
                            {group.tasks.map((task, index) => (
                                <TimelineTask key={task.id} task={task} onClick={() => onTaskClick(task)} />
                            ))}
                        </div>
                    </div>
                ))}

                {allTasks.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4">
                            <Clock className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">No tasks found</h3>
                        <p className="text-muted-foreground">Add tasks to your board to utilize the timeline view.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function TimelineTask({ task, onClick }: { task: any, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`
                group flex items-center gap-6 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-foreground/10 transition-all cursor-pointer relative overflow-hidden
                ${task.isCompleted ? "opacity-60 grayscale" : ""}
            `}
        >
            <div className={`active:scale-95 transition-transform absolute inset-0 z-0`}></div>

            <div className="flex-1 relative z-10 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${task.columnTitle === "Done" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                        {task.columnTitle}
                    </span>
                    {task.dueDate && (
                        <span className={`text-xs font-semibold flex items-center gap-1.5 ${task.isLate ? "text-destructive" : "text-muted-foreground"}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(task.dueDate), "MMM d")}
                        </span>
                    )}
                </div>

                <h4 className={`text-base font-bold text-foreground group-hover:text-primary transition-colors truncate ${task.isCompleted ? "line-through" : ""}`}>
                    {task.title}
                </h4>
            </div>

            <div className="flex items-center gap-4 relative z-10">
                {task.labels?.length > 0 && (
                    <div className="flex -space-x-1.5">
                        {task.labels.map((label: any) => (
                            <div key={label.id} className="w-2.5 h-2.5 rounded-full ring-2 ring-card" style={{ backgroundColor: label.color }} title={label.name} />
                        ))}
                    </div>
                )}

                {task.assignee && (
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                        {task.assignee.username[0].toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    )
}
