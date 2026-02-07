"use client"

import { Droppable, Draggable } from "@hello-pangea/dnd"
import { TaskCard } from "./TaskCard"
import { MoreHorizontal, Plus } from "lucide-react"
import { Button } from "./ui/button"

import { useState } from "react"
import { createTask, deleteColumn, updateColumn } from "@/app/actions"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

import { memo } from "react"

type ColumnProps = {
    column: any
    index: number
    onTaskClick: (task: any) => void
}

export const Column = memo(({ column, index, onTaskClick }: ColumnProps) => {
    const [isAddingTask, setIsAddingTask] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [columnTitle, setColumnTitle] = useState(column.title)

    const handleUpdateTitle = async () => {
        if (columnTitle !== column.title) {
            await updateColumn(column.id, columnTitle)
        }
        setIsEditing(false)
    }

    return (
        <Draggable draggableId={column.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="w-[85vw] sm:w-80 shrink-0 h-full max-h-full flex flex-col"
                >
                    {/* Column Header */}
                    <div
                        {...provided.dragHandleProps}
                        className="flex items-center justify-between p-2 mb-2 group/header"
                    >
                        <div className="flex items-center gap-2 flex-1">
                            {isEditing ? (
                                <Input
                                    value={columnTitle}
                                    onChange={(e) => setColumnTitle(e.target.value)}
                                    onBlur={handleUpdateTitle}
                                    onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
                                    autoFocus
                                    className="h-7 text-sm bg-background border-border"
                                />
                            ) : (
                                <>
                                    <h3
                                        className="font-bold text-sm text-foreground hover:text-primary cursor-pointer transition-colors"
                                        onDoubleClick={() => setIsEditing(true)}
                                    >
                                        {column.title}
                                    </h3>
                                    <span className="text-[10px] text-muted-foreground font-bold bg-muted px-2 py-0.5 rounded-full border border-border">{column.tasks.length}</span>
                                </>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-0 group-hover/header:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                                    onClick={() => {
                                        if (confirm("Are you sure you want to delete this list?")) {
                                            deleteColumn(column.id)
                                        }
                                    }}
                                >
                                    Delete List
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Tasks List */}
                    <Droppable droppableId={column.id} type="task">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`
                                flex-1 overflow-y-auto px-1 py-1 custom-scrollbar
                                transition-all rounded-xl
                                ${snapshot.isDraggingOver ? "bg-accent/50 ring-1 ring-blue-500/20" : ""}
                            `}
                            >
                                {column.tasks.map((task: any, index: number) => (
                                    <TaskCard key={task.id} task={task} index={index} onClick={onTaskClick} />
                                ))}
                                {provided.placeholder}

                                {/* Add Task Button */}
                                {isAddingTask ? (
                                    <div className="mt-2 p-3 bg-card rounded-xl border border-border shadow-lg animate-in fade-in zoom-in-95 duration-200">
                                        <form
                                            action={async (formData) => {
                                                const title = formData.get("title") as string
                                                if (title) {
                                                    await createTask(column.id, title, column.tasks.length)
                                                }
                                                setIsAddingTask(false)
                                            }}
                                            className="space-y-3"
                                        >
                                            <textarea
                                                name="title"
                                                autoFocus
                                                placeholder="Enter task title..."
                                                className="w-full bg-transparent text-sm focus:outline-none resize-none min-h-[60px] text-foreground placeholder:text-muted-foreground font-medium"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault()
                                                        e.currentTarget.form?.requestSubmit()
                                                    }
                                                    if (e.key === "Escape") setIsAddingTask(false)
                                                }}
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <Button type="button" size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={() => setIsAddingTask(false)}>Cancel</Button>
                                                <Button type="submit" size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold">Add</Button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-muted-foreground hover:text-blue-500 hover:bg-blue-500/5 mt-2 h-9 text-xs font-bold uppercase tracking-wider group transition-all rounded-xl"
                                        onClick={() => setIsAddingTask(true)}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-2 group-hover:scale-125 transition-transform" /> Add Task
                                    </Button>
                                )}
                            </div>
                        )}
                    </Droppable>
                </div>
            )}
        </Draggable>
    )
})
