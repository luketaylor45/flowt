"use client"

import { updateUserBoards } from "@/app/auth-actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function UserBoardManager({ user, boards }: { user: any, boards: any[] }) {
    const initialBoardIds = user.memberBoards.map((b: any) => b.id)

    return (
        <form action={updateUserBoards.bind(null, user.id)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {boards.map(board => (
                    <div key={board.id} className="group relative flex items-start space-x-4 p-4 rounded-2xl border border-border bg-card hover:border-foreground/10 transition-all">
                        <Checkbox
                            id={board.id}
                            name="boardIds"
                            value={board.id}
                            defaultChecked={initialBoardIds.includes(board.id)}
                            className="mt-1 border-border"
                        />
                        <div className="space-y-1.5 leading-none">
                            <Label htmlFor={board.id} className="text-sm font-bold text-foreground cursor-pointer group-hover:text-primary transition-colors uppercase tracking-tight">{board.title}</Label>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span>{board._count?.columns || 0} Columns</span>
                                <span>•</span>
                                <span>Active</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {boards.length === 0 && (
                <div className="p-12 rounded-2xl border-2 border-dashed border-border text-center">
                    <p className="text-sm font-medium text-muted-foreground">No projects available for assignment.</p>
                </div>
            )}

            <Button type="submit" className="h-10 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl transition-all shadow-xl shadow-primary/5">
                Update Board Access
            </Button>
        </form>
    )
}
