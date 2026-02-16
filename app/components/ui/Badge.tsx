import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "safe" | "warning" | "breached" | "completed"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                {
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80":
                        variant === "default",
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80":
                        variant === "secondary",
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80":
                        variant === "destructive",
                    "text-foreground": variant === "outline",

                    // Custom SLA statuses
                    "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200": variant === "safe",
                    "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200": variant === "warning",
                    "border-transparent bg-rose-100 text-rose-800 hover:bg-rose-200": variant === "breached",
                    "border-transparent bg-[#EFF6FF] text-[#0052D4] hover:bg-blue-100 border-blue-100": variant === "completed",
                },
                className
            )}
            {...props}
        />
    )
}

export { Badge }
