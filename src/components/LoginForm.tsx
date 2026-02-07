"use strict"
"use client"

import { useTransition, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { login, checkSystemSetup } from "@/app/auth-actions"

export default function LoginForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const router = useRouter()

    useEffect(() => {
        // Check if we need to run setup
        checkSystemSetup().then(needsSetup => {
            if (needsSetup) router.replace("/setup")
        })
    }, [router])

    const handleSubmit = async (formData: FormData) => {
        setError("")
        startTransition(async () => {
            const res = await login(formData)
            if (res?.error) {
                setError(res.error)
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Username</label>
                <Input name="username" placeholder="Enter your username" className="bg-secondary/30 border-white/5" required />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Password</label>
                <Input name="password" type="password" placeholder="••••••••" className="bg-secondary/30 border-white/5" required />
            </div>

            {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded text-center font-medium">
                    {error}
                </div>
            )}

            <Button type="submit" className="w-full font-bold h-11" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In"}
            </Button>
        </form>
    )
}
