"use client"

import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { Column } from "./Column"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Plus, Search, Shield, LogOut } from "lucide-react"
import { TaskDetailModal } from "./TaskDetailModal"
import { createColumn } from "@/app/actions"
import { logout } from "@/app/auth-actions"
import { Logo } from "@/components/Logo"
import { BoardLayout } from "./BoardLayout"
import { TimelineView } from "./TimelineView"

// Types should be better defined
type BoardViewProps = {
    initialBoard: any
    logoText?: string
}

export function BoardView({ initialBoard, logoText }: BoardViewProps) {
    const [board, setBoard] = useState(initialBoard)
    const [selectedTask, setSelectedTask] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddingList, setIsAddingList] = useState(false)
    const [currentView, setCurrentView] = useState<"board" | "timeline">("board")

    // Sync state when props change (e.g. after server action revalidation)
    useEffect(() => {
        setBoard(initialBoard)
    }, [initialBoard])

    const onDragEnd = async (result: any) => {
        const { destination, source, type, draggableId } = result
        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        // 1. Column Reordering
        if (type === "column") {
            const newColumns = Array.from(board.columns)
            const [removed] = newColumns.splice(source.index, 1)
            newColumns.splice(destination.index, 0, removed)

            // Update local state optimistically
            setBoard({ ...board, columns: newColumns })

            // Update database
            const { updateColumnsOrder } = await import("@/app/actions")
            await updateColumnsOrder(newColumns.map((c: any) => c.id))
            return
        }

        // 2. Task Reordering
        const sourceColIndex = board.columns.findIndex((c: any) => c.id === source.droppableId)
        const destColIndex = board.columns.findIndex((c: any) => c.id === destination.droppableId)

        const sourceCol = board.columns[sourceColIndex]
        const destCol = board.columns[destColIndex]

        if (sourceColIndex === destColIndex) {
            // Move within same column
            const newTasks = Array.from(sourceCol.tasks)
            const [removed] = newTasks.splice(source.index, 1)
            newTasks.splice(destination.index, 0, removed)

            const newColumns = Array.from(board.columns)
            newColumns[sourceColIndex] = { ...sourceCol, tasks: newTasks }

            setBoard({ ...board, columns: newColumns })

            // Update DB
            const { updateTaskColumn } = await import("@/app/actions")
            await updateTaskColumn(draggableId, sourceCol.id, destination.index)
        } else {
            // Move across columns
            const sourceTasks = Array.from(sourceCol.tasks)
            const [removed] = sourceTasks.splice(source.index, 1)

            const destTasks = Array.from(destCol.tasks)
            destTasks.splice(destination.index, 0, removed)

            const newColumns = Array.from(board.columns)
            newColumns[sourceColIndex] = { ...sourceCol, tasks: sourceTasks }
            newColumns[destColIndex] = { ...destCol, tasks: destTasks }

            setBoard({ ...board, columns: newColumns })

            // Update DB
            const { updateTaskColumn } = await import("@/app/actions")
            await updateTaskColumn(draggableId, destCol.id, destination.index)
        }
    }

    // Filter tasks based on search
    const filteredColumns = board.columns.map((col: any) => ({
        ...col,
        tasks: col.tasks.filter((t: any) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.labels.some((l: any) => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    }))

    const handleTaskUpdate = (updatedTask: any) => {
        setBoard((prev: any) => ({
            ...prev,
            columns: prev.columns.map((col: any) => ({
                ...col,
                tasks: col.tasks.map((task: any) =>
                    task.id === updatedTask.id ? { ...task, ...updatedTask } : task
                )
            }))
        }))
    }

    return (
        <BoardLayout
            title={board.title}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            logoText={logoText}
            currentView={currentView}
            onViewChange={setCurrentView}
        >
            <div className="flex flex-col h-full relative w-full">
                {currentView === "timeline" ? (
                    <TimelineView board={board} onTaskClick={setSelectedTask} />
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="board" type="column" direction="horizontal">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex h-full gap-4 lg:gap-6 pb-6 px-4 lg:px-8 overflow-x-auto relative z-10 pt-4 lg:pt-8"
                                >
                                    {filteredColumns.map((column: any, index: number) => (
                                        <Column
                                            key={column.id}
                                            column={column}
                                            index={index}
                                            onTaskClick={setSelectedTask}
                                        />
                                    ))}
                                    {provided.placeholder}

                                    {/* Add Column Button */}
                                    <div className="w-[85vw] sm:w-72 shrink-0">
                                        {isAddingList ? (
                                            <form
                                                action={async (formData) => {
                                                    const title = formData.get("title") as string
                                                    if (title) {
                                                        await createColumn(board.id, title, board.columns.length)
                                                    }
                                                    setIsAddingList(false)
                                                }}
                                                className="p-3 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-2xl space-y-3"
                                            >
                                                <input
                                                    autoFocus
                                                    name="title"
                                                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground font-semibold px-1 text-foreground"
                                                    placeholder="List Title..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Escape") setIsAddingList(false)
                                                    }}
                                                />
                                                <div className="flex gap-2">
                                                    <Button type="submit" size="sm" className="h-8 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs px-4">Create</Button>
                                                    <Button type="button" size="sm" variant="ghost" className="h-8 rounded-xl text-muted-foreground hover:text-foreground font-semibold text-xs" onClick={() => setIsAddingList(false)}>Cancel</Button>
                                                </div>
                                            </form>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full h-14 border-dashed border-border bg-accent/20 hover:bg-accent/40 rounded-2xl font-semibold text-muted-foreground hover:text-foreground transition-all group"
                                                onClick={() => setIsAddingList(true)}
                                            >
                                                <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Add List
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}

                <TaskDetailModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={handleTaskUpdate}
                    task={selectedTask}
                    boardLabels={board.labels || []}
                    boardId={board.id}
                />
            </div>
        </BoardLayout>
    )
}
