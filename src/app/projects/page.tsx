import { getBoards, getSystemSetting } from "@/app/actions"
import { Sidebar } from "@/components/Sidebar"
import { getSession, hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Layout, ArrowRight } from "lucide-react"
import { ProjectDeleteButton } from "@/components/ProjectDeleteButton"

export default async function ProjectsPage() {
    const session = await getSession()
    if (!session) redirect("/login")

    const [allBoards, logoText, adminRoleName, canCreateBoard] = await Promise.all([
        getBoards(session.user.id, session.user.isAdmin),
        getSystemSetting("logo_text"),
        getSystemSetting("admin_role_name") || "Administrator",
        hasPermission(session.user.id, "create_board")
    ])

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
            <Sidebar logoText={logoText} adminRoleName={adminRoleName} boards={allBoards} user={session.user} canCreateBoard={canCreateBoard} />

            <main className="flex-1 lg:ml-72 p-6 lg:p-10 space-y-12 bg-background min-h-screen">
                <header className="flex flex-col">
                    <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest mb-1">{logoText || "Flowt"}</span>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Projects</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage and view all your workspaces.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allBoards.map((board) => (
                        <Link key={board.id} href={`/board/${board.id}`}>
                            <div className="group relative rounded-2xl bg-card border border-border p-6 hover:border-foreground/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                        <Layout className="w-5 h-5" />
                                    </div>
                                    <ProjectDeleteButton boardId={board.id} boardTitle={board.title} />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors tracking-tight">{board.title}</h3>
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {board.columns.reduce((acc: number, col: any) => acc + (col._count?.tasks ?? 0), 0)} Tasks
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </div>
                            </div>
                        </Link>
                    ))}
                    {allBoards.length === 0 && (
                        <div className="col-span-full h-32 rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground bg-card">
                            <p className="text-sm font-medium">No projects found.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
