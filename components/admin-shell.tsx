"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"

interface AdminShellProps {
    userName: string
    children: React.ReactNode
}

export function AdminShell({ userName, children }: AdminShellProps) {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/admin/login")
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Desktop / tablet sidebar — collapsible icon-only mode */}
            <AdminSidebar
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((v) => !v)}
                userName={userName}
                onSignOut={handleSignOut}
                className="hidden md:flex"
            />

            {/* Mobile slide-in drawer */}
            {mobileNavOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 md:hidden"
                    onClick={() => setMobileNavOpen(false)}
                >
                    <div
                        className="h-full w-64"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AdminSidebar
                            userName={userName}
                            onSignOut={handleSignOut}
                            className="flex"
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col flex-1 min-w-0">
                <AdminTopbar
                    userName={userName}
                    onSignOut={handleSignOut}
                    onMobileMenuToggle={() => setMobileNavOpen((v) => !v)}
                />

                <main
                    className="flex-1 overflow-y-auto p-4 md:p-6"
                    style={{ backgroundColor: "#F0F4F8" }}
                >
                    {children}
                </main>
            </div>
        </div>
    )
}
