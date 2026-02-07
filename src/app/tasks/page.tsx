import { getBoards, getUserTasks, getSystemSetting, toggleTaskCompletion } from "@/app/actions"
import { Sidebar } from "@/components/Sidebar"
import { getSession, hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TaskCheckbox } from "@/components/TaskCheckbox"

export default async function TasksPage() {
    const session = await getSession()
    if (!session) redirect("/login")

    const [allBoards, userTasks, logoText, adminRoleName, canCreateBoard] = await Promise.all([
        getBoards(session.user.id, session.user.isAdmin),
        getUserTasks(),
        getSystemSetting("logoText"),
        getSystemSetting("adminRoleName") || "Administrator",
        hasPermission(session.user.id, "create_board")
    ])

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
            <Sidebar logoText={logoText} adminRoleName={adminRoleName} boards={allBoards} user={session.user} canCreateBoard={canCreateBoard} />

            <main className="flex-1 lg:ml-72 p-6 lg:p-10 space-y-12 bg-background min-h-screen">
                <header>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">My Tasks</h1>
                    <p className="text-muted-foreground font-medium mt-1">Tasks assigned to you across all projects.</p>
                </header>

                <div className="space-y-3">
                    {userTasks.map((task: any) => (
                        <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-foreground/10 transition-all group">
                            <TaskCheckbox taskId={task.id} isCompleted={task.isCompleted} />
                            <Link href={`/board/${task.column.boardId}`} className="flex-1 min-w-0">
                                <h4 className={`font-bold transition-colors truncate ${task.isCompleted ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary"}`}>{task.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{task.column.board.title}</span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <div className="flex gap-1.5">
                                        {task.labels.map((l: any) => (
                                            <div key={l.id} className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: l.color }} />
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                    {userTasks.length === 0 && (
                        <div className="p-8 rounded-2xl border-2 border-dashed border-border text-center text-muted-foreground font-medium text-sm">
                            You have no assigned tasks.
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
