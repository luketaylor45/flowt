import { Sidebar } from "@/components/Sidebar"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getBoards, getSystemSetting, getDashboardStats, getRecentActivity, getUpcomingDeadlines, getUserTasks } from "@/app/actions"
import Link from "next/link"
import { Folder, Clock, CheckSquare, TrendingUp, Plus, ArrowRight } from "lucide-react"
import { ModeToggle } from "@/components/ModeToggle"
import { UpcomingTasks } from "@/components/UpcomingTasks"

export default async function Dashboard() {
  const session = await getSession()
  if (!session?.user) redirect("/login")

  const logoText = await getSystemSetting("logo_text")
  const adminRoleName = await getSystemSetting("admin_role_name")
  const allBoards = await getBoards(session.user.id, session.user.isAdmin)
  const stats = await getDashboardStats()
  const activity = await getRecentActivity()
  // Fetch all upcoming tasks to let the client component filter them
  const deadlines = await getUpcomingDeadlines("all")
  const myTasks = await getUserTasks()

  const allowUserCreation = await getSystemSetting("allow_user_board_creation")
  const canCreateBoard = session.user.isAdmin || allowUserCreation === "true"

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
      <Sidebar logoText={logoText} adminRoleName={adminRoleName} boards={allBoards} user={session.user} canCreateBoard={canCreateBoard} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 lg:p-10 space-y-8 bg-background min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2 font-medium">Welcome back, {session.user.username}</p>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            {canCreateBoard && (
              <Link href="/projects" className="bg-foreground text-background px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 duration-200">
                <Plus className="w-4 h-4" /> New Project
              </Link>
            )}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column (2/3) - Stats, Upcoming, My Tasks */}
          <div className="lg:col-span-2 space-y-8">

            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm flex flex-col justify-between h-40 group hover:border-blue-500/20 transition-all">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Folder className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-accent px-2 py-1 rounded-lg uppercase tracking-wider">Total</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-foreground tracking-tight">{allBoards.length}</div>
                  <div className="text-xs font-bold text-muted-foreground mt-1">Active Projects</div>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm flex flex-col justify-between h-40 group hover:border-orange-500/20 transition-all">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-accent px-2 py-1 rounded-lg uppercase tracking-wider">Pending</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-foreground tracking-tight">{stats.pendingTasks}</div>
                  <div className="text-xs font-bold text-muted-foreground mt-1">Tasks In Progress</div>
                </div>
              </div>
            </div>

            {/* Secondary Stats (Less Noticeable) */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-border/60 hover:border-border transition-colors">
                <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Completed:</span>
                <span className="text-lg font-black text-foreground">{stats.completedTasks}</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-border/60 hover:border-border transition-colors">
                <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Efficiency:</span>
                <span className="text-lg font-black text-foreground">{stats.efficiency}</span>
              </div>
            </div>

            {/* Recent Tasks & Upcoming (Split or Stacked) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Upcoming Deadlines (with Client Slider) */}
              <div>
                <UpcomingTasks tasks={deadlines} />
              </div>

              {/* My Tasks */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground tracking-tight">My Tasks</h2>
                  <Link href="/tasks" className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {myTasks.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-foreground/10 transition-all group">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${task.isCompleted ? "bg-green-500" : "bg-blue-500"}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-bold truncate ${task.isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{task.column.board.title}</div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/board/${task.column.boardId}`} className="text-[10px] font-bold uppercase tracking-wider bg-accent px-2 py-1 rounded text-muted-foreground hover:text-foreground">
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                  {myTasks.length === 0 && <div className="text-xs font-medium text-muted-foreground italic py-4 text-center border border-dashed border-border rounded-xl">No tasks assigned to you</div>}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (1/3) - Activity Timeline */}
          <div className="space-y-6 lg:border-l lg:border-border lg:pl-8 min-h-[500px]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground tracking-tight">Activity</h2>
              <Link href="/activity" className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors">View All</Link>
            </div>

            <div className="relative border-l border-border ml-3 space-y-8 py-2">
              {activity.length > 0 ? activity.map((log: any) => (
                <div key={log.id} className="relative pl-6 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-card border-2 border-border group-hover:border-blue-500 group-hover:bg-blue-500 transition-colors" />

                  <div className="p-4 rounded-xl bg-card border border-border hover:border-foreground/10 transition-all shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                        {log.user?.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-foreground">{log.user?.username}</span>
                      <span className="text-[10px] font-bold text-muted-foreground bg-accent px-1.5 py-0.5 rounded ml-auto">
                        {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {log.action}
                    </p>
                    {log.details && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1 italic line-clamp-2">
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>
              )) : (
                <div className="pl-6 text-sm text-muted-foreground italic">No recent activity</div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
