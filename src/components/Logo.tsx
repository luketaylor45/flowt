import Link from "next/link"

interface LogoProps {
    className?: string
    size?: "default" | "large" | "small"
    text?: string
}

export function Logo({ className = "", size = "default", text = "Flowt" }: LogoProps) {
    const sizeClasses = {
        small: "text-2xl",
        default: "text-3xl",
        large: "text-5xl"
    }

    return (
        <Link href="/" className={`font-black tracking-tighter select-none transition-opacity hover:opacity-80 ${className}`}>
            <span className={`${sizeClasses[size]} text-foreground drop-shadow-sm`}>
                {text}
            </span>
        </Link>
    )
}
