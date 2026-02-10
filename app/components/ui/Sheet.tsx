'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

const Sheet = ({
    open,
    onOpenChange,
    children,
    side = "right",
    className
}: {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
    side?: "left" | "right" | "top" | "bottom"
    className?: string
}) => {
    if (!open) return null

    const sideClasses = {
        right: "inset-y-0 right-0 h-full border-l transition-transform data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
        left: "inset-y-0 left-0 h-full border-r transition-transform data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
        top: "inset-x-0 top-0 border-b transition-transform data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0",
        bottom: "inset-x-0 bottom-0 border-t transition-transform data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
    }

    return (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm">
            {/* Backdrop click to close */}
            <div
                className="absolute inset-0 z-0"
                onClick={() => onOpenChange?.(false)}
            />

            {/* Content Panel */}
            <div
                className={cn(
                    "relative z-10 bg-background shadow-lg ease-in-out duration-300",
                    sideClasses[side],
                    className
                )}
            >
                {children}
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    onClick={() => onOpenChange?.(false)}
                >
                    <span className="sr-only">Close</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Alignment helpers */}
            {side === 'right' && <div className="flex-1" />}
        </div>
    )
}

const SheetContent = ({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("grid gap-4 p-6 h-full", className)} {...props}>
        {children}
    </div>
)

const SheetHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left",
            className
        )}
        {...props}
    />
)

const SheetFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)

const SheetTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-lg font-semibold text-foreground", className)}
        {...props}
    />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
SheetDescription.displayName = "SheetDescription"

export {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
}
