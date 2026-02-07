"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession, hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function getBoards(userId: string, isAdmin: boolean) {
    if (isAdmin) {
        return await prisma.board.findMany({
            include: {
                columns: {
                    include: {
                        _count: {
                            select: { tasks: true }
                        }
                    }
                }
            }
        })
    }
    return await prisma.board.findMany({
        where: {
            OR: [
                { ownerId: userId },
                { members: { some: { id: userId } } }
            ]
        },
        include: {
            columns: {
                include: {
                    _count: {
                        select: { tasks: true }
                    }
                }
            }
        }
    })
}

export async function getDashboardStats() {
    const totalTasks = await prisma.task.count()
    const completedTasks = await (prisma as any).task.count({
        where: { column: { title: "Done" } }
    })
    const pendingTasks = totalTasks - completedTasks
    const efficiency = totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : "0%"

    return { totalTasks, completedTasks, pendingTasks, efficiency }
}

export async function getRecentActivity() {
    return await (prisma as any).activityLog.findMany({
        take: 5,
        orderBy: { timestamp: "desc" },
        include: {
            task: {
                include: {
                    column: {
                        include: {
                            board: true
                        }
                    }
                }
            },
            user: true
        }
    })
}

export async function getAllActivity() {
    return await (prisma as any).activityLog.findMany({
        take: 50,
        orderBy: { timestamp: "desc" },
        include: {
            task: {
                include: {
                    column: {
                        include: {
                            board: true
                        }
                    }
                }
            },
            user: true
        }
    })
}

export async function createBoard(formData: FormData) {
    const session = await getSession()
    if (!session) redirect("/login")

    if (!await hasPermission(session.user.id, "create_board")) {
        return { error: "You do not have permission to create boards." }
    }

    const title = formData.get("title") as string

    if (!title) return { error: "Title is required" }

    const board = await prisma.board.create({
        data: {
            title,
            ownerId: session.user.id,
            // Default columns
            columns: {
                create: [
                    { title: "To Do", order: 0 },
                    { title: "In Progress", order: 1 },
                    { title: "Done", order: 2 },
                ]
            }
        }
    })

    revalidatePath("/")
    redirect(`/board/${board.id}`)
}

export async function deleteBoard(boardId: string) {
    const session = await getSession()
    if (!session) redirect("/login")

    const board = await prisma.board.findUnique({
        where: { id: boardId }
    })

    if (!board) return { error: "Board not found" }

    // Only owner or admin can delete
    if (board.ownerId !== session.user.id && !session.user.isAdmin) {
        return { error: "You do not have permission to delete this board." }
    }

    await prisma.board.delete({
        where: { id: boardId }
    })

    revalidatePath("/")
    revalidatePath("/projects")
}

export async function getBoardData(boardId: string) {
    return await prisma.board.findUnique({
        where: { id: boardId },
        include: {
            labels: true,
            columns: {
                orderBy: { order: "asc" },
                include: {
                    tasks: {
                        orderBy: { order: "asc" },
                        include: {
                            labels: true,
                            assignee: true,
                            _count: { select: { subtasks: true, blockedBy: true } }
                        }
                    }
                }
            }
        }
    })
}

export async function getTaskDetails(taskId: string) {
    return await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            labels: true,
            subtasks: { orderBy: { id: "asc" } },
            activity: {
                orderBy: { timestamp: "desc" },
                include: { user: true }
            },
            assignee: true,
            column: { select: { title: true, boardId: true } },
            blocking: { select: { id: true, title: true, column: { select: { title: true } } } },
            blockedBy: { select: { id: true, title: true, column: { select: { title: true } } } }
        }
    })
}

export async function addDependency(taskId: string, blockingTaskId: string) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }

    if (taskId === blockingTaskId) return { error: "Cannot depend on self" }

    // Simple cycle check: ensure blockingTaskId is not already blocked by taskId
    const reverse = await prisma.task.findFirst({
        where: {
            id: blockingTaskId,
            blockedBy: { some: { id: taskId } }
        }
    })

    if (reverse) return { error: "Circular dependency detected" }

    await prisma.task.update({
        where: { id: taskId },
        data: {
            blockedBy: {
                connect: { id: blockingTaskId }
            }
        }
    })
    revalidatePath("/")
    return { success: true }
}

export async function removeDependency(taskId: string, blockingTaskId: string) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }

    await prisma.task.update({
        where: { id: taskId },
        data: {
            blockedBy: {
                disconnect: { id: blockingTaskId }
            }
        }
    })
    revalidatePath("/")
}

export async function getUserProfile(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            assignedTasks: {
                where: { column: { title: { not: "Done" } } },
                orderBy: { dueDate: "asc" },
                include: {
                    column: { select: { title: true, board: { select: { title: true, id: true } } } },
                    labels: true
                }
            },
            group: true
        }
    })
}

export async function updateTask(taskId: string, data: any) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }
    if (!await hasPermission(session.user.id, "edit_task")) return { error: "You do not have permission to edit tasks." }

    const task = await prisma.task.update({
        where: { id: taskId },
        data
    })
    revalidatePath("/")
    return { success: true, task }
}

export async function updateTaskColumn(taskId: string, columnId: string, order: number) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }
    if (!await hasPermission(session.user.id, "edit_task")) return { error: "Permission denied" }

    await prisma.task.update({
        where: { id: taskId },
        data: { columnId, order }
    })
    revalidatePath("/")
}

export async function updateColumnOrder(columnId: string, order: number) {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")
    if (!await hasPermission(session.user.id, "edit_board")) throw new Error("Permission denied")

    await prisma.column.update({
        where: { id: columnId },
        data: { order }
    })
    revalidatePath("/")
}

export async function updateColumnsOrder(columnIds: string[]) {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")
    if (!await hasPermission(session.user.id, "edit_board")) throw new Error("Permission denied")

    // Bulk update orders
    await Promise.all(columnIds.map((id, index) =>
        prisma.column.update({
            where: { id },
            data: { order: index }
        })
    ))
    revalidatePath("/")
}

export async function createColumn(boardId: string, title: string, order: number) {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")
    if (!await hasPermission(session.user.id, "edit_board")) throw new Error("Permission denied")

    await prisma.column.create({
        data: { boardId, title, order }
    })
    revalidatePath("/")
}

export async function deleteColumn(columnId: string) {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")
    if (!await hasPermission(session.user.id, "edit_board")) throw new Error("Permission denied")

    await prisma.column.delete({
        where: { id: columnId }
    })
    revalidatePath("/")
}

export async function updateColumn(columnId: string, title: string) {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")
    if (!await hasPermission(session.user.id, "edit_board")) throw new Error("Permission denied")

    await prisma.column.update({
        where: { id: columnId },
        data: { title }
    })
    revalidatePath("/")
}

export async function createTask(columnId: string, title: string, order: number) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }
    if (!await hasPermission(session.user.id, "create_task")) return { error: "Permission denied" }

    const task = await prisma.task.create({
        data: { columnId, title, order }
    })

    // Log activity
    if (session) {
        await (prisma as any).activityLog.create({
            data: {
                action: `created task "${title}"`,
                taskId: task.id,
                userId: session.user.id
            }
        })
    }

    revalidatePath("/")
    return task
}

export async function deleteTask(taskId: string) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }
    if (!await hasPermission(session.user.id, "delete_task")) return { error: "Permission denied" }

    await prisma.task.delete({
        where: { id: taskId }
    })
    revalidatePath("/")
    return { success: true }
}

export async function createSubtask(taskId: string, title: string) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }
    if (!await hasPermission(session.user.id, "edit_task")) return { error: "Permission denied" }

    await prisma.subtask.create({
        data: { taskId, title }
    })
    revalidatePath("/")
    return { success: true }
}

export async function toggleSubtask(subtaskId: string, isCompleted: boolean) {
    try {
        await prisma.subtask.update({
            where: { id: subtaskId },
            data: { isCompleted }
        })
        revalidatePath("/")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function deleteSubtask(subtaskId: string) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }
    if (!await hasPermission(session.user.id, "edit_task")) return { error: "Permission denied" }

    await prisma.subtask.delete({
        where: { id: subtaskId }
    })
    revalidatePath("/")
    return { success: true }
}

export async function createBoardLabel(boardId: string, name: string, color: string) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }
    if (!await hasPermission(session.user.id, "edit_board")) return { error: "Permission denied" }

    await prisma.label.create({
        data: { boardId, name, color }
    })
    revalidatePath("/")
}

export async function deleteBoardLabel(labelId: string) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }
    if (!await hasPermission(session.user.id, "edit_board")) return { error: "Permission denied" }

    await prisma.label.delete({
        where: { id: labelId }
    })
    revalidatePath("/")
}

export async function toggleTaskLabel(taskId: string, labelId: string, add: boolean) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }
    if (!await hasPermission(session.user.id, "edit_task")) return { error: "Permission denied" }

    await prisma.task.update({
        where: { id: taskId },
        data: {
            labels: {
                [add ? "connect" : "disconnect"]: { id: labelId }
            }
        }
    })
    revalidatePath("/")
    return { success: true }
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }
    if (!await hasPermission(session.user.id, "edit_task")) return { error: "Permission denied" }

    await prisma.task.update({
        where: { id: taskId },
        data: { isCompleted }
    })
    revalidatePath("/")
    return { success: true }
}

export async function createUser(formData: FormData) {
    const session = await getSession()
    if (!session?.user.isAdmin) throw new Error("Unauthorized")

    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const isAdmin = formData.get("isAdmin") === "on"

    if (!username || !password) return { error: "Missing fields" }

    await (prisma as any).user.create({
        data: { username, password, isAdmin }
    })
    revalidatePath("/admin")
}

export async function createGroup(formData: FormData) {
    const session = await getSession()
    if (!session?.user.isAdmin) return { error: "Unauthorized" }

    const name = formData.get("name") as string
    if (!name) return { error: "Missing name" }

    await (prisma as any).group.create({
        data: { name }
    })
    revalidatePath("/admin")
}

export async function deleteUser(userId: string) {
    const session = await getSession()
    if (!session?.user.isAdmin) return { error: "Unauthorized" }
    if (session.user.id === userId) return { error: "Cannot delete yourself" }

    await (prisma as any).user.delete({
        where: { id: userId }
    })
    revalidatePath("/admin")
}

export async function getSystemSetting(key: string) {
    const setting = await (prisma as any).systemSettings.findUnique({
        where: { key }
    })
    return setting?.value
}

export async function updateSystemSetting(key: string, value: string) {
    const session = await getSession()
    if (!session?.user.isAdmin) return { error: "Unauthorized" }

    await (prisma as any).systemSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value }
    })
    revalidatePath("/")
}

export async function assignTask(taskId: string, userId: string | null) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }
    if (!await hasPermission(session.user.id, "edit_task")) return { error: "Permission denied" }

    await (prisma as any).task.update({
        where: { id: taskId },
        data: { assigneeId: userId }
    })

    // Log the activity
    await (prisma as any).activityLog.create({
        data: {
            action: userId ? `assigned a user to task` : `unassigned user from task`,
            taskId,
            userId: session.user.id
        }
    })

    revalidatePath("/")
    return { success: true }
}

export async function getAllUsers() {
    const session = await getSession()
    if (!session) return [] // Return empty instead of error for this context as it's a getter

    return await prisma.user.findMany({
        select: { id: true, username: true }
    })
}

export async function getEligibleBoardUsers(boardId: string) {
    const session = await getSession()
    if (!session) return [] // Return empty instead of error

    return await prisma.user.findMany({
        where: {
            OR: [
                { isAdmin: true },
                { ownedBoards: { some: { id: boardId } } },
                { memberBoards: { some: { id: boardId } } }
            ]
        },
        select: { id: true, username: true }
    })
}

export async function getUpcomingDeadlines(range: "day" | "week" | "month" | "all" | "overdue" = "all") {
    const session = await getSession()
    if (!session) return []

    const now = new Date()
    let gte: Date | undefined = undefined
    let lte: Date | undefined = undefined

    if (range === "overdue") {
        lte = now
    } else if (range === "day") {
        gte = now
        lte = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    } else if (range === "week") {
        gte = now
        lte = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    } else if (range === "month") {
        gte = now
        lte = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    } else {
        // "all" - show everything upcoming. 
        // If we want overdue to be included in "all", we keep gte as undefined or a very old date.
    }

    return await prisma.task.findMany({
        where: {
            dueDate: {
                ...(gte ? { gte } : {}),
                ...(lte ? { lte } : {})
            },
            isCompleted: false, // Don't show completed tasks as approaching deadlines
            OR: [
                { assigneeId: session.user.id },
                { column: { board: { ownerId: session.user.id } } },
                { column: { board: { members: { some: { id: session.user.id } } } } }
            ]
        },
        orderBy: { dueDate: "asc" },
        take: 10,
        include: {
            column: { include: { board: true } }
        }
    })
}

export async function getUserTasks() {
    const session = await getSession()
    if (!session) return []

    return await prisma.task.findMany({
        where: {
            assigneeId: session.user.id,
            column: {
                title: { not: "Done" }
            }
        },
        orderBy: { order: "asc" },
        include: {
            column: { include: { board: true } },
            labels: true
        }
    })
}

export async function getBoardTasksSimple(boardId: string) {
    return await prisma.task.findMany({
        where: { column: { boardId } },
        select: { id: true, title: true, column: { select: { title: true } } }
    })
}
