"use server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { encrypt } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function checkSystemSetup() {
    const userCount = await prisma.user.count()
    return userCount === 0
}

export async function initialSetup(formData: FormData) {
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    if (!username || !password) throw new Error("Missing fields")

    const userCount = await prisma.user.count()
    if (userCount > 0) redirect("/login")

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            isAdmin: true
        }
    })

    // Login immediately
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const session = await encrypt({ user: { id: user.id, username: user.username, isAdmin: true }, expires })

        ; (await cookies()).set("session", session, { expires, httpOnly: true })

    redirect("/")
}

export async function login(formData: FormData) {
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    // Best effort:
    const allUsers = await prisma.user.findMany({
        where: {
            username: username // Try exact first
        }
    })

    let targetUser = allUsers[0]

    if (!targetUser) {
        // Fallback: This is inefficient but functional for small user bases
        const users = await prisma.user.findMany()
        targetUser = users.find(u => u.username.toLowerCase() === username.toLowerCase()) as any
    }

    if (!targetUser || !(await bcrypt.compare(password, targetUser.password))) {
        return { error: "Invalid credentials" }
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const session = await encrypt({ user: { id: targetUser.id, username: targetUser.username, isAdmin: targetUser.isAdmin }, expires })

        ; (await cookies()).set("session", session, { expires, httpOnly: true })

    redirect("/")
}

export async function logout() {
    (await cookies()).delete("session")
    redirect("/login")
}

export async function createUser(formData: FormData) {
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const groupId = formData.get("groupId") as string

    // Logic: If groupId is 'admin', set isAdmin=true, groupId=null
    // If groupId is a real ID, set isAdmin=false, groupId=ID

    const isAdmin = groupId === "admin"
    const finalGroupId = isAdmin ? null : groupId

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            isAdmin,
            groupId: finalGroupId
        }
    })

    revalidatePath("/admin")
}

export async function deleteUser(userId: string) {
    await prisma.user.delete({ where: { id: userId } })
    revalidatePath("/admin")
}

export async function createGroup(formData: FormData) {
    const name = formData.get("name") as string
    const permissions = formData.getAll("permissions") // Returns array of values

    const permissionsString = JSON.stringify(permissions)

    await prisma.group.create({
        data: { name, permissions: permissionsString }
    })

    revalidatePath("/admin")
}

export async function updateUserBoards(userId: string, formData: FormData) {
    const boardIds = formData.getAll("boardIds") as string[]

    // First, clear existing member boards? Or just set them?
    // Prisma "set" is easiest for M-N relations

    await prisma.user.update({
        where: { id: userId },
        data: {
            memberBoards: {
                set: boardIds.map(id => ({ id }))
            }
        }
    })

    revalidatePath(`/admin/users/${userId}`)
}

export async function deleteGroup(groupId: string) {
    // Check if group has users first? Or just null them out.
    // Prisma will set groupId to null if relation is not required.
    await prisma.group.delete({ where: { id: groupId } })
    revalidatePath("/admin")
}

export async function updateGroup(groupId: string, formData: FormData) {
    const name = formData.get("name") as string
    const permissions = formData.getAll("permissions")
    const permissionsString = JSON.stringify(permissions)

    await prisma.group.update({
        where: { id: groupId },
        data: { name, permissions: permissionsString }
    })

    revalidatePath("/admin")
}

export async function resetDatabase() {
    // Dangerous! DELETE ALL
    try {
        await prisma.activityLog.deleteMany()
        await prisma.subtask.deleteMany()
        await prisma.label.deleteMany()
        await prisma.task.deleteMany()
        await prisma.column.deleteMany()
        await prisma.board.deleteMany()
        await prisma.group.deleteMany()
        await prisma.user.deleteMany() // Logs out everyone

        // Maybe keep the current user? No, "reset database" usually implies full wipe.
    } catch (e) {
        throw new Error("Reset failed")
    }
    redirect("/setup")
}
