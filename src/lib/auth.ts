
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = process.env.SESSION_SECRET || "default-secret-key-change-me";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch {
        return null;
    }
}

import { prisma } from "./prisma";

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { group: true }
    });

    if (!user) return false;
    if (user.isAdmin) return true; // Admins have all permissions
    if (!user.group) return false;

    try {
        const permissions = JSON.parse(user.group.permissions);
        return Array.isArray(permissions) && permissions.includes(permission);
    } catch {
        return false;
    }
}

export async function getSession() {
    const session = (await cookies()).get("session")?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    if (!session) return;

    // Refresh logic if needed, simplify for now
    const parsed = await decrypt(session);

    if (!parsed) {
        return
    }

    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: "session",
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });
    return res;
}
