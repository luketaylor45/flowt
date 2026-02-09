import { startTransition } from "react"
import { login, checkSystemSetup } from "@/app/auth-actions"
import { getSystemSetting } from "@/app/actions"
import { redirect } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"
import LoginForm from "@/components/LoginForm"

export default async function LoginPage() {
    const logoText = await getSystemSetting("logo_text") || "Flowt"

    return (
        <div className="h-screen w-full flex items-center justify-center bg-background">
            <div className="w-full max-w-md p-8 rounded-xl bg-secondary/10 border border-white/5 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col items-center mb-8 gap-2">
                    <Logo size="large" text={logoText} />
                    <p className="text-muted-foreground font-medium">Sign in to continue</p>
                </div>

                <LoginForm />
            </div>
        </div>
    )
}
