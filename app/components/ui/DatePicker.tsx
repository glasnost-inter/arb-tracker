import * as React from "react"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

export type DatePickerProps = React.InputHTMLAttributes<HTMLInputElement>

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
    ({ className, ...props }, ref) => {
        return (
            <div className="relative">
                <input
                    type="date"
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        "pr-10", // Space for icon
                        "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
        )
    }
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
