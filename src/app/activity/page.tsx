import { getBoards, getAllActivity, getSystemSetting } from "@/app/actions"
import { Sidebar } from "@/components/Sidebar"
import { getSession, hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Folder } from "lucide-react"

export default async function ActivityPage() {
    const session = await getSession()
    if (!session) redirect("/login")

    const [allBoards, activity, logoText, adminRoleName, canCreateBoard] = await Promise.all([
        getBoards(session.user.id, session.user.isAdmin),
        getAllActivity(),
        getSystemSetting("logoText"),
        getSystemSetting("adminRoleName") || "Administrator",
        hasPermission(session.user.id, "create_board")
    ])

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
            <Sidebar logoText={logoText} adminRoleName={adminRoleName} boards={allBoards} user={session.user} canCreateBoard={canCreateBoard} />

            <main className="flex-1 lg:ml-72 p-6 lg:p-10 space-y-12 bg-background min-h-screen">
                <header>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">System Activity</h1>
                    <p className="text-muted-foreground font-medium mt-1">A chronologically ordered log of all system changes.</p>
                </header>

                <div className="max-w-3xl">
                    <div className="relative space-y-12 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
                        {activity.map((log: any) => (
                            <div key={log.id} className="relative flex items-start gap-6 group">
                                <div className="absolute left-0 mt-1.5 w-5 h-5 rounded-full bg-background border-2 border-border flex items-center justify-center z-10 group-hover:border-blue-500 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted group-hover:bg-blue-500 transition-colors" />
                                </div>
                                <div className="flex-1 ml-10 p-4 rounded-2xl bg-card border border-border hover:border-foreground/10 transition-colors shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        {log.userId ? (
                                            <Link href={`/profile/${log.userId}`} className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">{log.user?.username || "System"}</Link>
                                        ) : (
                                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{log.user?.username || "System"}</span>
                                        )}
                                        <span className="text-xs text-muted-foreground font-medium">{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-foreground leading-snug">
                                        {log.action} {log.task && <span className="font-semibold text-foreground">"{log.task.title}"</span>}
                                    </p>
                                    {log.task?.column?.board && (
                                        <Link href={`/board/${log.task.column.board.id}`} className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-lg bg-accent text-xs font-medium text-muted-foreground hover:text-blue-500 hover:border-blue-500/30 transition-all border border-border">
                                            <Folder className="w-3.5 h-3.5" />
                                            {log.task.column.board.title}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                        {activity.length === 0 && (
                            <div className="py-20 text-center text-muted-foreground">No activity recorded yet.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
