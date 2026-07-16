"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Inbox,
    Newspaper,
    Briefcase,
    FileText,
    Image as ImageIcon,
    Users,
    MessageSquareQuote,
    Handshake,
    Settings,
    UserCog,
    ChevronsLeft,
    ChevronsRight,
    LogOut,
} from "lucide-react"

type NavLink = {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

type NavGroup = {
    label: string
    items: NavLink[]
}

// Matches PRD §15.4 admin layout diagram exactly
const navGroups: NavGroup[] = [
    {
        label: "Content",
        items: [
            { title: "Leads", href: "/admin/leads", icon: Inbox },
            { title: "Blog", href: "/admin/blogs", icon: Newspaper },
            { title: "Cases", href: "/admin/case-studies", icon: Briefcase },
            { title: "Jobs", href: "/admin/jobs", icon: Briefcase },
            { title: "Pages", href: "/admin/pages", icon: FileText },
        ],
    },
    {
        label: "Media",
        items: [{ title: "Library", href: "/admin/media", icon: ImageIcon }],
    },
    {
        label: "People",
        items: [
            { title: "Team", href: "/admin/team", icon: Users },
            { title: "Testim.", href: "/admin/testimonials", icon: MessageSquareQuote },
            { title: "Partners", href: "/admin/partners", icon: Handshake },
        ],
    },
    {
        label: "Settings",
        items: [
            { title: "Site", href: "/admin/settings", icon: Settings },
            { title: "Users", href: "/admin/users", icon: UserCog },
        ],
    },
]

interface AdminSidebarProps {
    collapsed?: boolean
    onToggleCollapse?: () => void
    userName: string
    onSignOut: () => void
    className?: string
}

export function AdminSidebar({
    collapsed = false,
    onToggleCollapse,
    userName,
    onSignOut,
    className,
}: AdminSidebarProps) {
    const pathname = usePathname()

    return (
        <aside
            className={cn(
                "flex flex-col h-full shrink-0 transition-all duration-200",
                collapsed ? "w-16" : "w-64",
                className
            )}
            style={{ backgroundColor: "#0A2463" }}
        >
            {/* Dashboard link — top level, no group */}
            <div className="px-2 pt-4">
                <Link
                    href="/admin"
                    className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm border-l-4",
                        pathname === "/admin"
                            ? "border-[#1B4FD8] bg-white/10 text-white font-medium"
                            : "border-transparent text-[#CBD5E1] hover:bg-white/5"
                    )}
                >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Dashboard</span>}
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        {!collapsed && (
                            <p className="px-3 mb-1 text-[11px] font-medium uppercase tracking-wide text-[#CBD5E1]/60">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm border-l-4",
                                            isActive
                                                ? "border-[#1B4FD8] bg-white/10 text-white font-medium"
                                                : "border-transparent text-[#CBD5E1] hover:bg-white/5"
                                        )}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        {!collapsed && <span>{item.title}</span>}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom: avatar + user name + Sign Out, per PRD §15.4 */}
            <div className="border-t border-white/10 px-2 py-3">
                <div
                    className={cn(
                        "flex items-center gap-2 px-1 py-1",
                        collapsed && "justify-center"
                    )}
                >
                    <div className="h-7 w-7 rounded-full bg-white/10 text-white text-xs flex items-center justify-center font-medium shrink-0">
                        {userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                    </div>
                    {!collapsed && (
                        <span className="text-sm text-white truncate">{userName}</span>
                    )}
                </div>
                <button
                    onClick={onSignOut}
                    className={cn(
                        "flex items-center gap-2 w-full rounded-md px-2 py-1.5 mt-1 text-xs text-[#CBD5E1] hover:bg-white/5",
                        collapsed && "justify-center"
                    )}
                >
                    <LogOut className="h-3.5 w-3.5" />
                    {!collapsed && <span>Sign out</span>}
                </button>
            </div>

            {/* Collapse toggle — desktop icon-only mode per PRD */}
            <button
                onClick={onToggleCollapse}
                className="hidden md:flex items-center justify-center gap-2 mx-2 mb-2 py-2 rounded-md text-[#CBD5E1] hover:bg-white/5 text-xs"
            >
                {collapsed ? (
                    <ChevronsRight className="h-4 w-4" />
                ) : (
                    <>
                        <ChevronsLeft className="h-4 w-4" />
                        <span>Collapse</span>
                    </>
                )}
            </button>
        </aside>
    )
}
