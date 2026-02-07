"use client"

import { Trash2 } from "lucide-react"
import { deleteBoard } from "@/app/actions"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"

export function ProjectDeleteButton({ boardId, boardTitle }: { boardId: string, boardTitle: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 rounded-md bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-500/20 hover:bg-red-500/20 hover:text-red-400 h-auto"
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (confirm(`Are you sure you want to delete project "${boardTitle}"?`)) {
                    startTransition(async () => {
                        await deleteBoard(boardId)
                    })
                }
            }}
            disabled={isPending}
        >
            <Trash2 className="w-3 h-3 mr-1" />
            {isPending ? "Deleting..." : "Delete"}
        </Button>
    )
}
