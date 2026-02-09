import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User as UserIcon, Shield, Calendar, Mail, Fingerprint } from "lucide-react"
import Link from "next/link"
import { UserBoardManager } from "@/components/admin/UserBoardManager"
import { Sidebar } from "@/components/Sidebar"
import { getBoards, getSystemSetting } from "@/app/actions"

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session || !session.user.isAdmin) redirect("/")

    const { id } = await params

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            memberBoards: true,
            group: true
        }
    })

    if (!user) {
        return <div className="p-8">User account not found.</div>
    }

    const allBoards = await prisma.board.findMany({
        include: {
            _count: { select: { columns: true } }
        }
    })

    const dashboardBoards = await getBoards(session.user.id, session.user.isAdmin)
    const logoText = await getSystemSetting("logo_text")
    const adminRoleName = await getSystemSetting("admin_role_name") || "Administrator"

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
            <Sidebar logoText={logoText} boards={dashboardBoards} user={session.user} canCreateBoard={true} />

            <main className="flex-1 lg:ml-72 p-6 lg:p-10 space-y-12 bg-background min-h-screen">
                <header className="flex items-center gap-6">
                    <Link href="/admin">
                        <Button variant="outline" size="icon" className="group rounded-xl border-border bg-card hover:bg-accent transition-all">
                            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">User Details</h1>
                        <p className="text-muted-foreground font-medium mt-1">Refine permissions and board access for <span className="text-foreground font-bold">{user.username}</span>.</p>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-10">
                    {/* Left Column - Stats & Info */}
                    <div className="col-span-4 space-y-10">
                        <section className="p-8 rounded-[2rem] bg-card border border-border relative overflow-hidden group shadow-sm">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500 text-foreground">
                                <UserIcon className="w-24 h-24 rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center border-2 border-white/5 text-2xl font-black text-white shadow-2xl">
                                    {user.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">{user.username}</h2>
                                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                                        {user.isAdmin && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-black uppercase tracking-widest border border-blue-500/20">
                                                {adminRoleName}
                                            </span>
                                        )}
                                        {user.group && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-black uppercase tracking-widest border border-emerald-500/20">
                                                {user.group.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-border space-y-4">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Fingerprint className="w-3.5 h-3.5" /> Identity ID
                                    </div>
                                    <span className="text-foreground font-mono">{user.id.slice(0, 8)}...</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" /> Registered
                                    </div>
                                    <span className="text-foreground">{user.createdAt.toLocaleDateString()}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Board Access */}
                    <div className="col-span-8 space-y-8">
                        <section className="p-8 rounded-[2rem] bg-card border border-border space-y-8 shadow-sm">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Board Access</h3>
                                <p className="text-sm text-muted-foreground font-medium mt-1">Assign explicit member access to various system boards.</p>
                            </div>
                            <UserBoardManager user={user} boards={allBoards} />
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
