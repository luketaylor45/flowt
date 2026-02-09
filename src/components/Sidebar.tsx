"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, ListTodo, Bell, Folder, Plus, LogOut, Shield, Menu, X, Trash2 } from "lucide-react"
import { Logo } from "@/components/Logo"
import { logout } from "@/app/auth-actions"
import { deleteBoard } from "@/app/actions"
import { usePathname } from "next/navigation"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

type SidebarProps = {
    logoText?: string
    adminRoleName?: string
    boards: any[]
    user: any
    canCreateBoard?: boolean
}

export function Sidebar({ logoText, adminRoleName = "Administrator", boards, user, canCreateBoard = false }: SidebarProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const NavItem = ({ href, icon: Icon, label }: any) => {
        const isActive = pathname === href
        return (
            <Link href={href} onClick={() => setIsOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"}`}>
                    <Icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "group-hover:text-sidebar-foreground transition-colors"}`} />
                    <span className="font-semibold text-sm tracking-wide">{label}</span>
                </div>
            </Link>
        )
    }

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-6 right-6 z-[60] p-3 rounded-2xl bg-background/80 backdrop-blur-xl border border-border text-foreground active:scale-95 transition-all shadow-xl"
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                w-72 bg-sidebar border-r border-sidebar-border flex flex-col fixed inset-y-0 z-50
                transition-transform duration-500 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <div className="p-8 pb-4">
                    <Logo text={logoText || "Flowt"} />
                </div>

                <div className="px-4 space-y-1 mt-4 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="px-4 text-xs font-bold text-sidebar-foreground/40 uppercase tracking-widest mb-2">Overview</div>
                    <NavItem href="/" icon={Home} label="Dashboard" />
                    <NavItem href="/tasks" icon={ListTodo} label="My Tasks" />
                    <NavItem href="/activity" icon={Bell} label="Activity" />
                    {user.isAdmin && <NavItem href="/admin" icon={Shield} label="Settings" />}

                    <div className="px-4 space-y-1 mt-8">
                        <div className="flex items-center justify-between px-4 mb-2 group cursor-pointer">
                            <div className="text-xs font-bold text-sidebar-foreground/40 uppercase tracking-widest">Projects</div>
                            {canCreateBoard && (
                                <Link href="/projects" onClick={() => setIsOpen(false)}>
                                    <Plus className="w-3 h-3 text-sidebar-foreground/40 group-hover:text-blue-400 transition-colors" />
                                </Link>
                            )}
                        </div>
                        {boards.slice(0, 5).map((board) => (
                            <ContextMenu key={board.id}>
                                <ContextMenuTrigger>
                                    <Link href={`/board/${board.id}`} onClick={() => setIsOpen(false)}>
                                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all group">
                                            <div className="w-2 h-2 rounded-full bg-sidebar-foreground/20 group-hover:bg-blue-500 transition-colors" />
                                            <span className="font-medium text-sm truncate">{board.title}</span>
                                        </div>
                                    </Link>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-48 bg-background/95 backdrop-blur-xl border-border text-foreground">
                                    <ContextMenuItem
                                        className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                                        onClick={() => {
                                            if (confirm(`Are you sure you want to delete project "${board.title}"?`)) {
                                                deleteBoard(board.id)
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete Project
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        ))}
                        <NavItem href="/projects" icon={Folder} label="View All Projects" />
                    </div>
                </div>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors group relative">
                        <Link href={`/profile/${user.id}`} className="absolute inset-0 z-0" onClick={() => setIsOpen(false)} />
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform relative z-10 pointer-events-none">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
                            <div className="text-sm font-bold text-sidebar-foreground truncate">{user.username}</div>
                            <div className="text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-wider">{user.isAdmin ? adminRoleName : "Member"}</div>
                        </div>
                        <form action={logout} className="relative z-20">
                            <button className="text-sidebar-foreground/40 hover:text-red-400 transition-colors p-1" title="Log Out">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </aside>
        </>
    )
}
