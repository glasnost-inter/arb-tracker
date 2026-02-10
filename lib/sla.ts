export function calculateSlaTarget(startDate: Date, businessDays: number = 5): Date {
    const target = new Date(startDate)
    let daysAdded = 0
    while (daysAdded < businessDays) {
        target.setDate(target.getDate() + 1)
        // 0 is Sunday, 6 is Saturday
        if (target.getDay() !== 0 && target.getDay() !== 6) {
            daysAdded++
        }
    }
    return target
}

export type SlaStatus = 'Safe' | 'Warning' | 'Breached' | 'Completed'

export function getSlaComplianceStatus(targetDate: Date, isCompleted: boolean = false): SlaStatus {
    if (isCompleted) return 'Completed'

    const now = new Date()
    const diffTime = targetDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Breached'
    if (diffDays <= 2) return 'Warning'
    return 'Safe'
}
