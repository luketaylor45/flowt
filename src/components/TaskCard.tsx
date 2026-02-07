import { Draggable } from "@hello-pangea/dnd"
import Link from "next/link"
import { Calendar, CheckSquare, AlignLeft, Lock, Trash2, Edit } from "lucide-react"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
    ContextMenuCheckboxItem,
    ContextMenuSub,
    ContextMenuSubTrigger,
    ContextMenuSubContent
} from "@/components/ui/context-menu"
import { deleteTask, toggleTaskCompletion } from "@/app/actions"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

import { memo } from "react"
import { motion } from "framer-motion"

// Define types locally for now or import from Prisma
type TaskProps = {
    task: any // Typed properly later
    index: number
    onClick: (task: any) => void
}

export const TaskCard = memo(({ task, index, onClick }: TaskProps) => {
    const handleCompletion = (e: any) => {
        e.stopPropagation()
        toggleTaskCompletion(task.id, !task.isCompleted)
    }

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-3 group relative outline-none"
                    style={{ ...provided.draggableProps.style }}
                    onClick={() => onClick(task)}
                >
                    <ContextMenu>
                        <ContextMenuTrigger>
                            <motion.div
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    p-4 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-foreground/10 transition-all 
                                    cursor-grab active:cursor-grabbing shadow-sm hover:shadow-lg
                                    active:bg-accent duration-200
                                    ${snapshot.isDragging ? "ring-2 ring-blue-500/50 rotate-2 shadow-2xl z-50 bg-background opacity-95 scale-105" : ""}
                                    ${task.isCompleted ? "opacity-60 grayscale-[0.5]" : ""}
                                `}>
                                {/* Labels */}
                                {task.labels && task.labels.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                                        {task.labels.map((label: any) => (
                                            <div key={label.id} className="py-1 relative group/label">
                                                <div
                                                    className="h-1.5 min-w-[24px] rounded-full transition-all duration-300 group-hover/label:h-5 group-hover/label:px-3 group-hover/label:min-w-[50px] flex items-center justify-center overflow-hidden relative shadow-sm"
                                                    style={{ backgroundColor: label.color }}
                                                    title={label.name}
                                                >
                                                    <span className="text-[9px] font-black text-white opacity-0 group-hover/label:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-tighter">
                                                        {label.name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-3 items-start">
                                    <Checkbox
                                        checked={task.isCompleted}
                                        onCheckedChange={(c) => {
                                            if (!task.isCompleted && task._count?.blockedBy > 0) return
                                            toggleTaskCompletion(task.id, !!c)
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        disabled={!task.isCompleted && task._count?.blockedBy > 0}
                                        className={`mt-1 w-4 h-4 rounded-md border-border data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 ${!task.isCompleted && task._count?.blockedBy > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                        title={!task.isCompleted && task._count?.blockedBy > 0 ? "Resolve dependencies first" : ""}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-semibold text-foreground group-hover:text-primary leading-normal transition-colors line-clamp-2 select-none ${task.isCompleted ? "line-through decoration-muted-foreground text-muted-foreground" : ""}`}>
                                            {task.title}
                                        </h4>
                                    </div>
                                </div>

                                {/* Meta Info */}
                                <div className="flex items-center justify-between mt-3 text-muted-foreground">
                                    <div className="flex items-center gap-3">
                                        {(task.description || (task._count && task._count.subtasks > 0)) && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                                                {task._count && task._count.subtasks > 0 && (
                                                    <div className={`flex items-center gap-1 ${task._count.subtasks > 0 ? "text-blue-500/80" : ""}`}>
                                                        <CheckSquare className="w-3 h-3" />
                                                        <span>{task._count.subtasks}</span>
                                                    </div>
                                                )}
                                                {task.description && <AlignLeft className="w-3 h-3" />}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {task._count?.blockedBy > 0 && (
                                            <div className="flex items-center text-destructive/80" title="Blocked by dependency">
                                                <Lock className="w-3 h-3" />
                                            </div>
                                        )}

                                        {task.dueDate && (
                                            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${new Date(task.dueDate) < new Date() && !task.isCompleted ? "text-destructive" : ""}`}>
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(task.dueDate).getDate()}</span>
                                            </div>
                                        )}
                                        {task.assignee && (
                                            <Link
                                                href={`/profile/${task.assignee.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground hover:border-primary transition-colors"
                                                title={task.assignee.username}
                                            >
                                                {task.assignee.username.charAt(0).toUpperCase()}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48 bg-background/95 backdrop-blur-xl border-border text-foreground">
                            <ContextMenuItem onClick={() => onClick(task)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit Task
                            </ContextMenuItem>
                            <ContextMenuItem
                                onClick={() => {
                                    if (!task.isCompleted && task._count?.blockedBy > 0) return
                                    toggleTaskCompletion(task.id, !task.isCompleted)
                                }}
                                disabled={!task.isCompleted && task._count?.blockedBy > 0}
                                className={!task.isCompleted && task._count?.blockedBy > 0 ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                <CheckSquare className="w-4 h-4 mr-2" /> {task.isCompleted ? "Mark Incomplete" : "Mark Complete"}
                            </ContextMenuItem>
                            <ContextMenuSeparator className="bg-border" />
                            <ContextMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/10" onClick={() => deleteTask(task.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>
                </div>
            )}
        </Draggable>
    )
})
