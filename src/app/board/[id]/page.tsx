import { getBoardData, getSystemSetting, getBoards } from "@/app/actions"
import { BoardView } from "@/components/BoardView"
import { notFound } from "next/navigation"
import { getSession, hasPermission } from "@/lib/auth"
import { Sidebar } from "@/components/Sidebar"

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session) return notFound() // or redirect login

    const { id } = await params

    const [board, allBoards, logoText, adminRoleName, canCreateBoard] = await Promise.all([
        getBoardData(id),
        getBoards(session.user.id, session.user.isAdmin),
        getSystemSetting("logo_text"),
        getSystemSetting("admin_role_name"),
        hasPermission(session.user.id, "create_board")
    ])

    if (!board) {
        notFound()
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
            <Sidebar logoText={logoText} adminRoleName={adminRoleName || "Administrator"} boards={allBoards} user={session.user} canCreateBoard={canCreateBoard} />
            <main className="flex-1 lg:ml-72 h-screen overflow-hidden">
                <BoardView initialBoard={board} logoText={logoText || "Flowt"} />
            </main>
        </div>
    )
}
