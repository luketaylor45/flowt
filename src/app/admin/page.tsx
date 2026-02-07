import { prisma } from "@/lib/prisma"
import { Shield, Users as UsersIcon, Trash2, ArrowRight, Settings, Layout, Lock } from "lucide-react"
import { CreateUserForm, CreateGroupForm, DangerZone, SettingsForm, GroupList } from "@/components/admin/AdminForms"
import { Logo } from "@/components/Logo"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSystemSetting, getBoards } from "@/app/actions"
import { Sidebar } from "@/components/Sidebar"

export default async function AdminPage() {
    // Verify admin access
    const session = await getSession()
    if (!session || !session.user.isAdmin) {
        redirect("/")
    }

    const groups = await prisma.group.findMany()
    const users = await prisma.user.findMany({ include: { group: true } })
    const allBoards = await getBoards(session.user.id, session.user.isAdmin)
    const logoText = await getSystemSetting("logoText")
    const adminRoleName = await getSystemSetting("adminRoleName") || "Administrator"

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
            <Sidebar logoText={logoText} boards={allBoards} user={session.user} canCreateBoard={true} />

            <main className="flex-1 lg:ml-72 p-6 lg:p-10 space-y-12 bg-background min-h-screen">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">System Settings</h1>
                        <p className="text-muted-foreground font-medium mt-1">Manage global configuration, users, and access control.</p>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-10">
                    {/* Left Column - Main Management */}
                    <div className="col-span-8 space-y-10">
                        {/* Instance Branding */}
                        <section className="p-8 rounded-[2rem] bg-card/20 border border-border space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-accent/50 text-foreground">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground tracking-tight">Configuration</h2>
                            </div>
                            <SettingsForm initialLogoText={logoText || "Flowt"} initialAdminRoleName={adminRoleName} />
                        </section>

                        {/* User Management */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                                    <UsersIcon className="w-5 h-5 text-muted-foreground" />
                                    Users
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {users.map(u => (
                                    <div key={u.id} className="group flex items-center justify-between p-4 rounded-2xl bg-card/20 border border-border hover:bg-card/40 transition-all">
                                        <div className="flex items-center gap-4">
                                            <Link href={`/profile/${u.id}`} className="w-12 h-12 rounded-xl bg-gradient-to-br from-card to-accent flex items-center justify-center border border-border hover:border-blue-500/30 transition-all group/avatar">
                                                <span className="text-sm font-bold text-foreground group-hover/avatar:scale-110 transition-transform">{u.username[0].toUpperCase()}</span>
                                            </Link>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/profile/${u.id}`} className="font-bold text-foreground hover:text-blue-400 transition-colors">{u.username}</Link>
                                                    {u.isAdmin && (
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-black uppercase tracking-widest border border-blue-500/20">
                                                            {adminRoleName}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">
                                                    {u.group?.name || (u.isAdmin ? adminRoleName : "None")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button asChild size="sm" variant="outline" className="h-9 px-4 rounded-xl text-xs font-bold border-border bg-card/50 hover:bg-accent hover:text-foreground text-muted-foreground">
                                                <Link href={`/admin/users/${u.id}`}>Edit Details</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Groups */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-muted-foreground" />
                                    Groups
                                </h2>
                            </div>
                            <GroupList groups={groups} users={users} />
                        </section>
                    </div>

                    {/* Right Column - Create Forms */}
                    <div className="col-span-4 space-y-10">
                        {/* Add User Form */}
                        <section className="p-8 rounded-[2rem] bg-card/30 border border-border space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Create User</h3>
                                <p className="text-xs text-muted-foreground font-medium mt-1">Add a new account to the system.</p>
                            </div>
                            <CreateUserForm groups={groups} adminRoleName={adminRoleName} />
                        </section>

                        {/* Create Group Form */}
                        <section className="p-8 rounded-[2rem] bg-card/30 border border-border space-y-8 border-dashed">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Create Group</h3>
                                <p className="text-xs text-muted-foreground font-medium mt-1">Define membership roles and permissions.</p>
                            </div>
                            <CreateGroupForm />
                        </section>

                        {/* Danger Zone */}
                        <section className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/20 space-y-6">
                            <div className="flex items-center gap-3 text-red-500">
                                <Shield className="w-5 h-5" />
                                <h2 className="text-lg font-bold tracking-tight">Danger Zone</h2>
                            </div>
                            <DangerZone />
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
