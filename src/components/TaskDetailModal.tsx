import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useTransition, useEffect } from "react"
import { Calendar as CalendarIcon, AlignLeft, CheckSquare, Tag, Trash2, X, History, User, Users, Clock, Plus, Lock, Link as LinkIcon } from "lucide-react"
import { updateTask, createSubtask, toggleSubtask, deleteSubtask, createBoardLabel, deleteBoardLabel, toggleTaskLabel, deleteTask, getAllUsers, assignTask, getTaskDetails, addDependency, removeDependency, getBoardTasksSimple, toggleTaskCompletion, getEligibleBoardUsers } from "@/app/actions"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { CustomCalendar } from "@/components/ui/CustomCalendar"
import { toast } from "sonner"

type TaskDetailModalProps = {
    isOpen: boolean
    onClose: () => void
    onUpdate?: (updatedTask: any) => void
    task: any
    boardLabels: any[]
    boardId: string
}

const PRESET_COLORS = [
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Green", value: "#22c55e" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Purple", value: "#a855f7" },
    { name: "Pink", value: "#ec4899" },
]

export function TaskDetailModal({ isOpen, onClose, onUpdate, task: initialTask, boardLabels = [], boardId }: TaskDetailModalProps) {
    const [task, setTask] = useState<any>(initialTask)
    const [isPending, startTransition] = useTransition()
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
    const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false)
    const [isMemberPopoverOpen, setIsMemberPopoverOpen] = useState(false)
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [isDependencyPopoverOpen, setIsDependencyPopoverOpen] = useState(false)
    const [availableTasks, setAvailableTasks] = useState<any[]>([])
    const [allUsers, setAllUsers] = useState<any[]>([])

    // New Label State
    const [newLabelName, setNewLabelName] = useState("")
    const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[4].value)
    const [isCreatingLabel, setIsCreatingLabel] = useState(false)

    useEffect(() => {
        if (isOpen && initialTask) {
            setTask(initialTask) // Reset to initial
            getEligibleBoardUsers(boardId).then(setAllUsers)
            getTaskDetails(initialTask.id).then((fullTask) => {
                if (fullTask) setTask(fullTask)
            })
        }
    }, [isOpen, initialTask, boardId])

    if (!task) return null

    const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value !== task.title) {
            const oldValue = task.title
            const newValue = e.target.value

            const updated = { ...task, title: newValue }
            setTask(updated)
            onUpdate?.(updated)

            startTransition(async () => {
                const res = await updateTask(task.id, { title: newValue })
                if (res?.error) {
                    toast.error(res.error)
                    // Revert UI
                    setTask({ ...task, title: oldValue })
                    onUpdate?.({ ...task, title: oldValue })
                }
            })
        }
    }

    const handleDescriptionBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (e.target.value !== (task.description || "")) {
            const oldValue = task.description
            const newValue = e.target.value
            const updated = { ...task, description: newValue }
            setTask(updated)
            onUpdate?.(updated)
            startTransition(async () => {
                const res = await updateTask(task.id, { description: newValue })
                if (res?.error) {
                    toast.error(res.error)
                    setTask({ ...task, description: oldValue })
                    onUpdate?.({ ...task, description: oldValue })
                }
            })
        }
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const oldValue = task.dueDate
        const date = e.target.value ? new Date(e.target.value).toISOString() : null
        const updated = { ...task, dueDate: date }
        setTask(updated)
        onUpdate?.(updated)
        startTransition(async () => {
            const res = await updateTask(task.id, { dueDate: date })
            if (res?.error) {
                toast.error(res.error)
                setTask({ ...task, dueDate: oldValue })
                onUpdate?.({ ...task, dueDate: oldValue })
            }
        })
    }

    const handleAddSubtask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSubtaskTitle.trim()) return

        const title = newSubtaskTitle
        setNewSubtaskTitle("")

        startTransition(async () => {
            const res = await createSubtask(task.id, title)
            if (res?.error) {
                toast.error(res.error)
                return
            }
            // Re-fetch to get new state accurately
            getTaskDetails(task.id).then(t => t && setTask(t))
        })
    }

    const handleOpenDependencyPopover = async () => {
        setIsDependencyPopoverOpen(!isDependencyPopoverOpen)
        if (!isDependencyPopoverOpen && task.column?.boardId) {
            const tasks = await getBoardTasksSimple(task.column.boardId)
            setAvailableTasks(tasks)
        }
    }

    const handleDeleteTask = () => {
        if (confirm("Are you sure you want to delete this task?")) {
            startTransition(async () => {
                const res = await deleteTask(task.id)
                if (res?.error) {
                    toast.error(res.error)
                    return
                }
                onClose()
                toast.success("Task deleted")
            })
        }
    }

    const completedSubtasks = task.subtasks?.filter((st: any) => st.isCompleted).length || 0
    const totalSubtasks = task.subtasks?.length || 0
    const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100



    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="max-w-lg w-[95vw] sm:w-full max-h-[85vh] h-full bg-background/95 border-border shadow-2xl p-0 gap-0 overflow-hidden sm:rounded-[1.75rem] outline-none flex flex-col transform-gpu"
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>{task.title}</DialogTitle>
                    <DialogDescription>Task details</DialogDescription>
                </DialogHeader>

                <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    transition={{ type: "spring", damping: 35, stiffness: 500 }}
                    style={{ willChange: "transform, opacity" }}
                    className="flex flex-col h-full w-full overflow-hidden transform-gpu"
                >
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-accent/5 pr-14">
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${task.isCompleted ? "bg-blue-500/10 border-blue-500/20 text-blue-400 cursor-pointer active:scale-95" : (task.blockedBy?.length > 0 ? "bg-muted border-border text-muted-foreground cursor-not-allowed opacity-50" : "bg-card border-border text-muted-foreground hover:border-foreground/10 group cursor-pointer active:scale-95 active:bg-accent/80")}`}
                                onClick={async () => {
                                    if (!task.isCompleted && task.blockedBy?.length > 0) return
                                    const updated = { ...task, isCompleted: !task.isCompleted }
                                    setTask(updated) // Optimistic
                                    onUpdate?.(updated)
                                    await toggleTaskCompletion(task.id, !task.isCompleted)
                                }}
                                title={task.blockedBy?.length > 0 ? "Resolve dependencies first" : ""}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.isCompleted ? "bg-blue-500 border-blue-500" : (task.blockedBy?.length > 0 ? "border-muted" : "border-muted-foreground group-hover:border-foreground font-bold")}`}>
                                    {task.isCompleted && <CheckSquare className="w-3 h-3 text-primary-foreground" />}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">{task.isCompleted ? "Completed" : "Mark Complete"}</span>
                            </div>
                            <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-[10px] uppercase font-bold tracking-widest px-2 py-1">
                                {task.column?.title}
                            </Badge>
                        </div>
                    </div>

                    {/* Popovers (Simple absolute positioning for now) */}


                    {/* Labels Popover - Inlined to fix focus bug */}


                    <div className="p-4 lg:p-6 flex-1 overflow-y-auto custom-scrollbar">
                        {/* Title */}
                        <div className="mb-5">
                            <Input
                                defaultValue={task.title}
                                onBlur={handleTitleBlur}
                                className="text-xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground text-foreground tracking-tight cursor-default focus:cursor-text"
                            />
                        </div>

                        {/* Labels Display - Simplified, moved management to sidebar */}
                        {task.labels && task.labels.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {task.labels.map((label: any) => (
                                    <div
                                        key={label.id}
                                        className="flex items-center gap-1.5 pl-2 pr-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm ring-1 ring-inset ring-border"
                                        style={{ backgroundColor: label.color + "22", color: label.color }}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: label.color }} />
                                        {label.name}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Dependencies Section - Subtle if empty, clear if active */}
                        <div className={`mb-8 p-4 rounded-2xl border transition-all duration-300 ${task.blockedBy?.length > 0 || task.blocking?.length > 0 ? "bg-accent/40 border-border shadow-sm" : "bg-transparent border-border opacity-50 hover:opacity-100"}`}>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                    <Lock className={`w-3 h-3 ${task.blockedBy?.length > 0 ? "text-red-400" : "text-muted-foreground"}`} />
                                    <span>{task.blockedBy?.length > 0 ? "Status: Blocked" : "Dependencies"}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[9px] uppercase font-bold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg px-2 active:scale-90 transition-transform"
                                    onClick={handleOpenDependencyPopover}
                                >
                                    <Plus className="w-2.5 h-2.5 mr-1" /> Link
                                </Button>
                            </div>

                            {isDependencyPopoverOpen && (
                                <div className="relative">
                                    <div className="absolute top-2 left-0 w-full max-w-sm z-50 bg-popover border border-border rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 max-h-60 overflow-y-auto custom-scrollbar">
                                        <div className="text-[10px] font-bold text-muted-foreground px-3 py-2 uppercase tracking-widest border-b border-border mb-2">Block this task by:</div>
                                        {availableTasks.filter(t => t.id !== task.id && !task.blockedBy?.some((b: any) => b.id === t.id)).length === 0 ? (
                                            <div className="text-xs text-muted-foreground p-4 text-center italic">No other tasks to link</div>
                                        ) : (
                                            availableTasks.filter(t => t.id !== task.id && !task.blockedBy?.some((b: any) => b.id === t.id)).map(t => (
                                                <button
                                                    key={t.id}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground flex items-center justify-between group transition-colors"
                                                    onClick={async () => {
                                                        const res = await addDependency(task.id, t.id)
                                                        if (res?.error) {
                                                            toast.error(res.error)
                                                            return
                                                        }
                                                        const updated = await getTaskDetails(task.id)
                                                        if (updated) setTask(updated)
                                                        setIsDependencyPopoverOpen(false)
                                                        toast.success("Dependency added")
                                                    }}
                                                >
                                                    <span className="truncate flex-1">{t.title}</span>
                                                    <Badge variant="outline" className="ml-2 text-[9px] py-0 border-border bg-accent/20 text-muted-foreground group-hover:text-foreground uppercase">{t.column.title}</Badge>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {(task.blockedBy?.length > 0 || task.blocking?.length > 0) ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                    {task.blockedBy?.length > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="text-[9px] font-bold text-red-400/80 uppercase tracking-widest px-1 flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" /> Blocked By
                                            </div>
                                            {task.blockedBy.map((t: any) => (
                                                <div key={t.id} className="flex items-center justify-between p-2 rounded-xl bg-red-500/5 border border-red-500/10 group animate-in fade-in slide-in-from-left-1">
                                                    <span className="text-[11px] font-bold text-destructive truncate flex-1 mr-2">{t.title}</span>
                                                    <button
                                                        onClick={async () => {
                                                            await removeDependency(task.id, t.id)
                                                            const updated = await getTaskDetails(task.id)
                                                            if (updated) setTask(updated)
                                                        }}
                                                        className="text-red-500/50 hover:text-red-400 transition-colors p-0.5"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {task.blocking?.length > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">Blocking</div>
                                            {task.blocking.map((t: any) => (
                                                <div key={t.id} className="flex items-center p-2 rounded-xl bg-muted/50 border border-border opacity-75">
                                                    <span className="text-[11px] text-muted-foreground truncate">{t.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-2 text-center py-2">
                                    <p className="text-[10px] text-muted-foreground italic">No task dependencies defined</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-7 space-y-5">
                                {/* Description */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        <AlignLeft className="w-3.5 h-3.5" /> Description
                                    </div>
                                    <textarea
                                        className="w-full min-h-[120px] bg-card rounded-xl p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y transition-all placeholder:text-muted-foreground leading-relaxed border border-border"
                                        placeholder="Add a detailed description..."
                                        defaultValue={task.description || ""}
                                        onBlur={handleDescriptionBlur}
                                        spellCheck={false}
                                    />
                                </div>

                                {/* Subtasks */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            <CheckSquare className="w-3.5 h-3.5" /> Checklist
                                        </div>
                                        {totalSubtasks > 0 && <span className="text-xs font-mono text-zinc-500">{Math.round(progress)}%</span>}
                                    </div>

                                    {totalSubtasks > 0 && (
                                        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        {task.subtasks?.map((st: any) => (
                                            <div key={st.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={st.isCompleted}
                                                    onChange={async (e) => {
                                                        const res = await toggleSubtask(st.id, e.target.checked)
                                                        if (res?.error) {
                                                            toast.error(res.error)
                                                            return
                                                        }
                                                        const t = await getTaskDetails(task.id)
                                                        if (t) setTask(t)
                                                    }}
                                                    className="w-4 h-4 rounded border-border bg-card checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer"
                                                />
                                                <span className={`flex-1 text-sm font-medium ${st.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                                    {st.title}
                                                </span>
                                                <button
                                                    onClick={async () => {
                                                        const res = await deleteSubtask(st.id)
                                                        if (res?.error) {
                                                            toast.error(res.error)
                                                            return
                                                        }
                                                        const t = await getTaskDetails(task.id)
                                                        if (t) setTask(t)
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <form onSubmit={handleAddSubtask} className="flex gap-2">
                                        <Input
                                            value={newSubtaskTitle}
                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                            placeholder="Add an item..."
                                            className="h-9 bg-card border-border focus-visible:ring-blue-500/20 text-sm"
                                        />
                                        <Button type="submit" size="sm" variant="secondary" disabled={!newSubtaskTitle} className="h-9 font-bold">Add</Button>
                                    </form>
                                </div>
                            </div>

                            <div className="md:col-span-12 lg:col-span-5 space-y-5">


                                {/* Meta Info Sidebar */}
                                <div className="space-y-8">
                                    {/* Assignee Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assignee</div>
                                            <button
                                                onClick={() => setIsMemberPopoverOpen(!isMemberPopoverOpen)}
                                                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase"
                                            >
                                                Change
                                            </button>
                                        </div>
                                        <Popover open={isMemberPopoverOpen} onOpenChange={setIsMemberPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                {task.assignee ? (
                                                    <div className="relative group/assignee">
                                                        <Link href={`/profile/${task.assignee.id}`} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:border-border hover:bg-card/80 transition-all shadow-sm cursor-pointer active:scale-[0.97] duration-200">
                                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner group-hover/assignee:rotate-3 transition-transform">
                                                                {task.assignee.username[0].toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-foreground group-hover/assignee:text-primary transition-colors">{task.assignee.username}</span>
                                                                <span className="text-[10px] text-muted-foreground font-medium tracking-tight">Assigned Contributor</span>
                                                            </div>
                                                        </Link>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                setIsMemberPopoverOpen(true)
                                                            }}
                                                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all opacity-0 group-hover/assignee:opacity-100"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card/50 border border-dashed border-border hover:border-border hover:bg-card transition-all text-muted-foreground text-sm italic group active:scale-[0.97] duration-200"
                                                    >
                                                        <div className="w-8 h-8 rounded-full border border-dashed border-border flex items-center justify-center group-hover:border-foreground/20">
                                                            <User className="w-4 h-4 opacity-30" />
                                                        </div>
                                                        Add Assignee
                                                    </button>
                                                )}
                                            </PopoverTrigger>
                                            <PopoverContent className="w-56 p-2 bg-popover border-border shadow-2xl" align="end">
                                                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-2 px-2 pt-1 tracking-widest">Assign Member</div>
                                                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                                                    {allUsers.map(u => (
                                                        <button
                                                            key={u.id}
                                                            className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold text-foreground hover:bg-accent hover:text-accent-foreground flex items-center justify-between transition-colors group"
                                                            onClick={async () => {
                                                                const res = await assignTask(task.id, u.id)
                                                                if (res?.error) {
                                                                    toast.error(res.error)
                                                                    return
                                                                }
                                                                const t = await getTaskDetails(task.id)
                                                                if (t) setTask(t)
                                                                setIsMemberPopoverOpen(false)
                                                                toast.success("Assignee updated")
                                                            }}
                                                        >
                                                            {u.username}
                                                            {task.assigneeId === u.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="h-px bg-border my-2" />
                                                <button
                                                    onClick={async () => {
                                                        const res = await assignTask(task.id, null)
                                                        if (res?.error) {
                                                            toast.error(res.error)
                                                            return
                                                        }
                                                        const t = await getTaskDetails(task.id)
                                                        if (t) setTask(t)
                                                        setIsMemberPopoverOpen(false)
                                                    }}
                                                >
                                                    Unassign Current
                                                </button>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Due Date Section */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Due Date</div>
                                            {task.dueDate && (
                                                <button
                                                    onClick={() => handleDateChange({ target: { value: "" } } as any)}
                                                    className="text-[10px] font-bold text-muted-foreground hover:text-destructive transition-colors uppercase"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                            <PopoverTrigger asChild>
                                                <div
                                                    className="relative group/date cursor-pointer active:scale-[0.97] transition-transform duration-200"
                                                >
                                                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border text-sm font-bold text-foreground hover:border-border hover:bg-card/80 transition-all shadow-sm">
                                                        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border group-hover/date:border-blue-500/30 transition-all group-hover/date:bg-blue-500/5">
                                                            <CalendarIcon className="w-3.5 h-3.5 text-blue-500 group-hover/date:scale-110 transition-transform" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-foreground font-bold text-xs">{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Set Date"}</span>
                                                            <span className="text-[9px] text-muted-foreground font-medium tracking-tight">Project Deadline</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-transparent border-none shadow-none" align="end">
                                                <CustomCalendar
                                                    selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                                    onSelect={(date) => {
                                                        const isoDate = date ? date.toISOString() : null
                                                        const updated = { ...task, dueDate: isoDate }
                                                        setTask(updated)
                                                        onUpdate?.(updated)
                                                        startTransition(async () => {
                                                            await updateTask(task.id, { dueDate: isoDate })
                                                            setIsCalendarOpen(false)
                                                        })
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Labels Management Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Labels</div>
                                            <button
                                                onClick={() => setIsLabelPopoverOpen(true)}
                                                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase"
                                            >
                                                Manage
                                            </button>
                                        </div>
                                        <Popover open={isLabelPopoverOpen} onOpenChange={setIsLabelPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <div className="flex flex-wrap gap-1.5 mt-1 min-h-[44px] p-3 rounded-2xl bg-muted/20 border border-border hover:border-foreground/10 transition-all cursor-pointer group/labels active:scale-[0.98]">
                                                    {task.labels?.length > 0 ? task.labels.map((l: any) => (
                                                        <div
                                                            key={l.id}
                                                            className="h-2.5 w-8 rounded-full transition-transform hover:scale-110 ring-1 ring-border"
                                                            style={{ backgroundColor: l.color }}
                                                            title={l.name}
                                                        />
                                                    )) : (
                                                        <span className="text-xs text-muted-foreground italic font-medium">Assign labels...</span>
                                                    )}
                                                    <div
                                                        className="w-6 h-6 rounded-full border border-dashed border-border flex items-center justify-center hover:border-foreground/20 hover:bg-accent transition-all ml-auto"
                                                    >
                                                        <Plus className="w-3 h-3 text-muted-foreground" />
                                                    </div>
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-72 p-4 bg-popover border-border shadow-3xl" align="end">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">Board Labels</div>
                                                    <button onClick={() => setIsLabelPopoverOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-3.5 h-3.5" /></button>
                                                </div>

                                                <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar mb-4 pr-1">
                                                    {boardLabels.map(label => {
                                                        const isSelected = task.labels?.some((l: any) => l.id === label.id)
                                                        return (
                                                            <div key={label.id} className="flex items-center gap-2 group">
                                                                <button
                                                                    onClick={async () => {
                                                                        const res = await toggleTaskLabel(task.id, label.id, !isSelected)
                                                                        if (res?.error) {
                                                                            toast.error(res.error)
                                                                            return
                                                                        }
                                                                        const t = await getTaskDetails(task.id)
                                                                        if (t) setTask(t)
                                                                    }}
                                                                    className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected ? "bg-accent border-border text-foreground shadow-lg" : "hover:bg-accent border-transparent text-muted-foreground"}`}
                                                                >
                                                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: label.color }} />
                                                                    <span className="truncate">{label.name}</span>
                                                                    {isSelected && <CheckSquare className="w-3.5 h-3.5 ml-auto text-blue-500 animate-in zoom-in-50 duration-200" />}
                                                                </button>
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation()
                                                                        if (confirm("Delete this label from the board?")) {
                                                                            await deleteBoardLabel(label.id)
                                                                        }
                                                                    }}
                                                                    className="p-1.5 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                                    {boardLabels.length === 0 && <div className="text-muted-foreground text-[10px] italic px-2 py-4 text-center">No board labels defined</div>}
                                                </div>

                                                <div className="pt-4 border-t border-border space-y-3">
                                                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">New Label</div>
                                                    <Input
                                                        placeholder="Label title..."
                                                        value={newLabelName}
                                                        onChange={e => setNewLabelName(e.target.value)}
                                                        className="h-9 bg-card text-xs border-border focus-visible:ring-blue-500/30 font-bold placeholder:font-medium"
                                                    />
                                                    <div className="grid grid-cols-8 gap-1.5">
                                                        {PRESET_COLORS.map(c => (
                                                            <button
                                                                key={c.value}
                                                                className={`w-full aspect-square rounded-full transition-all hover:scale-110 ${newLabelColor === c.value ? "ring-2 ring-foreground scale-110 shadow-lg" : "ring-1 ring-border opacity-40 hover:opacity-100"}`}
                                                                style={{ backgroundColor: c.value }}
                                                                onClick={() => setNewLabelColor(c.value)}
                                                                title={c.name}
                                                            />
                                                        ))}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="w-full h-9 text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/10 active:scale-95 duration-200"
                                                        disabled={!newLabelName}
                                                        onClick={async () => {
                                                            await createBoardLabel(boardId, newLabelName, newLabelColor)
                                                            setNewLabelName("")
                                                        }}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1.5" /> Create & Add
                                                    </Button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Sidebar Actions */}
                                    <div className="pt-4 space-y-3">
                                        <Button
                                            variant="outline"
                                            className="w-full h-10 rounded-xl bg-card border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 font-bold text-xs uppercase tracking-widest shadow-sm transition-all"
                                            onClick={handleDeleteTask}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Task
                                        </Button>
                                    </div>
                                </div>

                                {/* Activity */}
                                <div className="space-y-4 pt-8 border-t border-border">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        <History className="w-3.5 h-3.5" /> History
                                    </div>
                                    <div className="space-y-4 relative before:absolute before:top-0 before:bottom-0 before:left-[5px] before:w-px before:bg-border">
                                        {task.activity?.map((log: any) => (
                                            <div key={log.id} className="relative pl-4 text-xs text-muted-foreground">
                                                <div className="absolute left-[3px] top-[5px] w-[5px] h-[5px] rounded-full bg-muted-foreground" />
                                                {log.userId ? (
                                                    <Link href={`/profile/${log.userId}`} className="font-bold text-foreground hover:text-blue-400 transition-colors">{log.user?.username || "System"}</Link>
                                                ) : (
                                                    <span className="font-bold text-foreground">{log.user?.username || "System"}</span>
                                                )} {log.action}
                                                <div className="opacity-50 text-[10px] mt-0.5">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        ))}
                                        <div className="relative pl-4 text-xs text-muted-foreground">
                                            <div className="absolute left-[3px] top-[5px] w-[5px] h-[5px] rounded-full bg-blue-500" />
                                            Created <span className="opacity-50 ml-1">{new Date(task.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
}
