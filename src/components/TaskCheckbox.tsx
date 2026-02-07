"use client"

import { toggleTaskCompletion } from "@/app/actions"
import { useTransition } from "react"
import { Check } from "lucide-react"

interface TaskCheckboxProps {
    taskId: string
    isCompleted?: boolean
}

export function TaskCheckbox({ taskId, isCompleted = false }: TaskCheckboxProps) {
    const [isPending, startTransition] = useTransition()

    return (
        <button
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                startTransition(async () => {
                    await toggleTaskCompletion(taskId, !isCompleted)
                })
            }}
            disabled={isPending}
            className={`
                w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                ${isCompleted
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-zinc-700 hover:border-blue-500 hover:bg-blue-500/20 text-transparent"
                }
                ${isPending ? "opacity-50 cursor-wait" : "cursor-pointer"}
            `}
        >
            <Check className={`w-3.5 h-3.5 transition-transform ${isCompleted ? "scale-100" : "scale-0"}`} strokeWidth={4} />
        </button>
    )
}
