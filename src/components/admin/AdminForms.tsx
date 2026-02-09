"use client"

import { createUser, createGroup, resetDatabase, deleteGroup, deleteUser, updateGroup } from "@/app/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useTransition } from "react"
import { PERMISSIONS } from "@/lib/constants"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Shield, Users, ArrowRight, X, Check, Edit2 } from "lucide-react"

export function CreateUserForm({ groups, adminRoleName = "Administrator" }: { groups: any[], adminRoleName?: string }) {
    return (
        <form action={createUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Username</Label>
                    <Input name="username" placeholder="e.g. jdoe" className="bg-background border-border h-10 text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                    <Input name="password" type="password" placeholder="••••••••" className="bg-background border-border h-10 text-foreground placeholder:text-muted-foreground" />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role / Assignment</Label>
                <Select name="groupId">
                    <SelectTrigger className="bg-background border-border h-10 text-foreground font-bold">
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                        <SelectItem value="admin" className="font-bold">{adminRoleName} (Super User)</SelectItem>
                        {groups.map(group => (
                            <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit" className="w-full h-10 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all">
                Add Account
            </Button>
        </form>
    )
}

export function GroupList({ groups, users }: { groups: any[], users: any[] }) {
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    return (
        <div className="space-y-3">
            {groups.map(group => (
                <div key={group.id} className="group flex flex-col p-4 rounded-2xl bg-card border border-border hover:border-foreground/10 transition-all shadow-sm">
                    {editingGroupId === group.id ? (
                        <form action={async (formData) => {
                            await updateGroup(group.id, formData)
                            setEditingGroupId(null)
                        }} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Input
                                    name="name"
                                    defaultValue={group.name}
                                    className="h-8 bg-background border-border font-bold text-foreground w-64"
                                />
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingGroupId(null)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                    <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-4 rounded-lg">
                                        <Check className="w-4 h-4 mr-2" /> Save
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-accent/30 border border-border">
                                {PERMISSIONS.map(perm => {
                                    const hasPerm = JSON.parse(group.permissions || "[]").includes(perm.id)
                                    return (
                                        <div key={perm.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`edit-${group.id}-${perm.id}`}
                                                name="permissions"
                                                value={perm.id}
                                                defaultChecked={hasPerm}
                                                className="border-white/10"
                                            />
                                            <label htmlFor={`edit-${group.id}-${perm.id}`} className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest cursor-pointer">
                                                {perm.label}
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>
                        </form>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-bold text-foreground">{group.name}</div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                                        {users.filter(u => u.groupId === group.id).length} Members
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                                    onClick={() => setEditingGroupId(group.id)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete group "${group.name}"?`)) {
                                            startTransition(async () => await deleteGroup(group.id))
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            {groups.length === 0 && (
                <div className="p-8 rounded-2xl border-2 border-dashed border-white/5 text-center text-zinc-600 font-medium text-sm">
                    No groups created.
                </div>
            )}
        </div>
    )
}

export function CreateGroupForm() {
    return (
        <form action={createGroup} className="space-y-6">
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Group Name</Label>
                <Input name="name" placeholder="e.g. Design Team" className="bg-background border-border h-10 text-foreground placeholder:text-muted-foreground" />
            </div>

            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions & Permissions</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl border border-border bg-accent/20">
                    {PERMISSIONS.map(perm => (
                        <div key={perm.id} className="flex items-center gap-2 group cursor-pointer">
                            <Checkbox id={perm.id} name="permissions" value={perm.id} className="border-border" />
                            <label
                                htmlFor={perm.id}
                                className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer"
                            >
                                {perm.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Button type="submit" variant="secondary" className="w-full h-10 font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl transition-all">
                Create Group
            </Button>
        </form>
    )
}

export function DangerZone() {
    const [confirmReset, setConfirmReset] = useState(false)

    return (
        <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
                <h3 className="font-bold text-foreground mb-1">System Wipe</h3>
                <p className="text-sm text-muted-foreground font-medium leading-snug">Permanently purge all data from the database. This includes users, projects, and all activity records.</p>
            </div>

            {!confirmReset ? (
                <Button variant="ghost" className="h-10 px-6 font-bold text-red-500 hover:bg-red-500/10 rounded-xl" onClick={() => setConfirmReset(true)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Reset System
                </Button>
            ) : (
                <form action={resetDatabase} className="flex gap-2 animate-in fade-in slide-in-from-right-5">
                    <Button variant="ghost" type="button" className="font-bold rounded-xl" onClick={() => setConfirmReset(false)}>Cancel</Button>
                    <Button variant="destructive" type="submit" className="font-bold rounded-xl px-6">Confirm Purge</Button>
                </form>
            )}
        </div>
    )
}

import { updateSystemSetting } from "@/app/actions"

export function SettingsForm({ initialLogoText, initialAdminRoleName = "Administrator" }: { initialLogoText: string, initialAdminRoleName?: string }) {
    return (
        <div className="space-y-8">
            <form action={async (formData) => {
                const text = formData.get("logo_text") as string
                if (text) await updateSystemSetting("logo_text", text)
            }} className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Instance Branding</Label>
                    <div className="flex gap-3">
                        <Input
                            name="logo_text"
                            defaultValue={initialLogoText}
                            placeholder="Flowt"
                            className="bg-background border-border h-10"
                        />
                        <Button type="submit" className="h-10 px-6 font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all shadow-md">Apply</Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">Sets the application name in the sidebar.</p>
                </div>
            </form>

            <form action={async (formData) => {
                const name = formData.get("admin_role_name") as string
                if (name) await updateSystemSetting("admin_role_name", name)
            }} className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Role Label</Label>
                    <div className="flex gap-3">
                        <Input
                            name="admin_role_name"
                            defaultValue={initialAdminRoleName}
                            placeholder="Administrator"
                            className="bg-background border-border h-10"
                        />
                        <Button type="submit" className="h-10 px-6 font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all shadow-md">Apply</Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">Renames the default 'Administrator' group/label across the system.</p>
                </div>
            </form>
        </div>
    )
}

