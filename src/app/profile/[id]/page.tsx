import { getUserProfile, getSystemSetting, getBoards } from "@/app/actions"
import { Sidebar } from "@/components/Sidebar"
import { notFound } from "next/navigation"
import { getSession, hasPermission } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckSquare, Hash, User as UserIcon } from "lucide-react"

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session) return notFound()

    const { id } = await params
    const [userProfile, logoText, adminRoleName, allBoards, canCreateBoard] = await Promise.all([
        getUserProfile(id),
        getSystemSetting("logoText"),
        getSystemSetting("adminRoleName"),
        getBoards(session.user.id, session.user.isAdmin),
        hasPermission(session.user.id, "create_board")
    ])

    if (!userProfile) return notFound()

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
            <Sidebar logoText={logoText} adminRoleName={adminRoleName || "Administrator"} boards={allBoards} user={session.user} canCreateBoard={canCreateBoard} />
            <main className="flex-1 lg:ml-72 h-screen overflow-y-auto custom-scrollbar p-6 lg:p-8 bg-background">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-6 p-6 rounded-3xl bg-card border border-border transition-colors shadow-sm">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                            <span className="text-4xl font-bold text-white">{userProfile.username[0].toUpperCase()}</span>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold text-foreground tracking-tight">{userProfile.username}</h1>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                                    {userProfile.isAdmin ? (adminRoleName || "Administrator") : "Member"}
                                </Badge>
                                {userProfile.group && (
                                    <Badge variant="outline" className="border-primary/20 text-primary">
                                        {userProfile.group.name}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-card border-border shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Assigned Tasks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground flex items-center gap-2">
                                    <CheckSquare className="w-6 h-6 text-blue-500" />
                                    {userProfile.assignedTasks.length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Pending</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground flex items-center gap-2">
                                    <Hash className="w-6 h-6 text-orange-500" />
                                    {userProfile.assignedTasks.length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Role</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground flex items-center gap-2">
                                    <UserIcon className="w-6 h-6 text-purple-500" />
                                    {userProfile.isAdmin ? "Admin" : "User"}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pending Tasks List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-blue-500" />
                            Pending Tasks
                        </h2>

                        {userProfile.assignedTasks.length === 0 ? (
                            <div className="text-muted-foreground text-sm italic">No pending tasks assigned.</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {userProfile.assignedTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="group flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-foreground/10 transition-all shadow-sm"
                                    >
                                        <div className="space-y-1">
                                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {task.title}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                    {task.column.board.title}
                                                </span>
                                                <span className="text-border">•</span>
                                                <span className="">{task.column.title}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {task.labels.map(label => (
                                                <span
                                                    key={label.id}
                                                    className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                                                    style={{ backgroundColor: label.color + "20", color: label.color }}
                                                >
                                                    {label.name}
                                                </span>
                                            ))}
                                            {task.dueDate && (
                                                <div className={`flex items-center gap-1.5 text-xs font-semibold ${new Date(task.dueDate) < new Date() ? "text-destructive" : "text-muted-foreground"}`}>
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
