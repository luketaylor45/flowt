"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBoard } from "@/app/actions"
import { toast } from "sonner"
import { Plus, Layout } from "lucide-react"

type CreateBoardModalProps = {
    isOpen: boolean
    onClose: () => void
}

export function CreateBoardModal({ isOpen, onClose }: CreateBoardModalProps) {
    const [title, setTitle] = useState("")
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        const formData = new FormData()
        formData.append("title", title)

        startTransition(async () => {
            const result = await createBoard(formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Project created successfully")
                setTitle("")
                onClose()
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border shadow-2xl rounded-[2rem]">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 mb-4">
                        <Layout className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-2xl font-black tracking-tight">Create Project</DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium">
                        Give your new workspace a name to get started.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                            Project Title
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g. Website Redesign"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-12 bg-card border-border focus-visible:ring-blue-500/20 text-base font-bold rounded-xl px-4"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl font-bold text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim() || isPending}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 h-11 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            {isPending ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
