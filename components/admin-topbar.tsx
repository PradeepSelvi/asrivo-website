"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Menu, LogOut, User, KeyRound } from "lucide-react"

interface Notification {
    id: string
    message: string
    createdAt: string
}

interface AdminTopbarProps {
    userName: string
    unreadCount?: number
    notifications?: Notification[]
    onSignOut: () => void
    onMobileMenuToggle: () => void
}

export function AdminTopbar({
    userName,
    unreadCount = 0,
    notifications = [],
    onSignOut,
    onMobileMenuToggle,
}: AdminTopbarProps) {
    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    return (
        <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={onMobileMenuToggle}
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <span className="font-semibold text-sm" style={{ color: "#0A2463" }}>
                    ASCIRVO
                </span>
                <Badge variant="secondary" className="text-[10px]">
                    Admin
                </Badge>
            </div>

            <div className="flex items-center gap-1">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span
                                    className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full text-[10px] leading-4 text-white text-center"
                                    style={{ backgroundColor: "#EF4444" }}
                                >
                                    {unreadCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72">
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            Notifications
                        </div>
                        <DropdownMenuSeparator />
                        {notifications.length === 0 ? (
                            <div className="px-2 py-3 text-sm text-muted-foreground">
                                No new notifications.
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((n) => (
                                <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5">
                                    <span className="text-sm">{n.message}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {n.createdAt}
                                    </span>
                                </DropdownMenuItem>
                            ))
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2">
                            <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium hidden sm:inline">
                                {userName}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                            <User className="h-4 w-4 mr-2" />
                            My profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Change password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onSignOut} className="text-destructive">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
