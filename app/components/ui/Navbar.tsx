'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from './Container'
import { cn } from '@/lib/utils' // Assuming a utility for class merging exists or I can use template literals
import { ClipboardList, Zap, ShieldCheck } from 'lucide-react'

// Simple helper for class merging if not defined globally
function classNames(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

export function Navbar() {
    const pathname = usePathname()

    const navItems = [
        {
            name: 'Projects',
            href: '/',
            icon: ClipboardList,
            active: pathname === '/' || pathname.startsWith('/submission')
        },
        {
            name: 'Side Quests',
            href: '/side-quest',
            icon: Zap,
            active: pathname.startsWith('/side-quest')
        },
        {
            name: 'Admin & Backup',
            href: '/admin',
            icon: ShieldCheck,
            active: pathname === '/admin'
        }
    ]

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-background/60 backdrop-blur-xl shadow-sm transition-all duration-300">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0052D4] to-[#4364F7] shadow-lg">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-[#0052D4] to-[#4364F7] bg-clip-text text-transparent sm:block hidden">
                                ARB TRACKER
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={classNames(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 group",
                                        item.active
                                            ? "bg-[#0052D4]/10 text-[#0052D4]"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={classNames(
                                        "h-4 w-4 transition-transform group-hover:scale-110",
                                        item.active ? "text-[#0052D4]" : "text-muted-foreground"
                                    )} />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>
            </Container>
        </nav>
    )
}
