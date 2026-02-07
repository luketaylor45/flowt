"use client"

import { initialSetup } from "@/app/auth-actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"
import { ShieldCheck } from "lucide-react"

export default function SetupPage() {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-background">
            <div className="w-full max-w-md p-8 rounded-xl bg-secondary/10 border border-yellow-500/20 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />

                <div className="flex flex-col items-center mb-8 gap-4">
                    <Logo size="large" />
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-foreground">Initial Setup</h1>
                        <p className="text-muted-foreground mt-1">Create the administrator account.</p>
                    </div>
                </div>

                <form action={initialSetup} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Admin Username</label>
                        <Input name="username" placeholder="admin" className="bg-secondary/30 border-white/5" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Password</label>
                        <Input name="password" type="password" placeholder="••••••••" className="bg-secondary/30 border-white/5" />
                    </div>

                    <Button type="submit" className="w-full bg-yellow-500/80 hover:bg-yellow-500 text-black font-semibold">
                        Create Administrator
                    </Button>
                </form>
            </div>
        </div>
    )
}
