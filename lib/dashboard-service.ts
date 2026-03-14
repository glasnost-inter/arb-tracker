import { z } from 'zod'
import { prisma } from './prisma'

// Schema for dashboard filters and sorting
export const DashboardParamsSchema = z.object({
    status: z.enum(['Submitted', 'In-Review', 'Revision Needed', 'Approved', 'Rejected']).optional().catch(undefined),
    decision: z.enum(['Approved', 'Approved with Conditions', 'Rejected']).optional().catch(undefined),
    sortBy: z.string().default('updatedAt-desc'),
    search: z.string().optional(),
    hasPendingTasks: z.preprocess((val) => val === 'true', z.boolean()).default(false),
    dateField: z.enum(['createdAt', 'updatedAt', 'slaTarget']).optional().catch(undefined),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
})

export type DashboardParams = z.infer<typeof DashboardParamsSchema>

export async function getDashboardProjects(params: DashboardParams) {
    const { status, decision, sortBy, search, hasPendingTasks, dateField, startDate, endDate } = params

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (status) where.status = status
    if (decision) where.decision = decision
    if (search) {
        where.name = {
            contains: search,
        }
    }

    // Date Range Logic
    if (dateField && (startDate || endDate)) {
        where[dateField] = {};
        if (startDate) {
            where[dateField].gte = new Date(`${startDate}T00:00:00.000Z`);
        }
        if (endDate) {
            where[dateField].lte = new Date(`${endDate}T23:59:59.999Z`);
        }
    }

    // Parse sortBy string: "field-dir,field2-dir2"
    const orderBy = sortBy.split(',').map(s => {
        const [field, dir] = s.split('-')
        return { [field]: dir as 'asc' | 'desc' }
    })

    // Always append updatedAt for stable sorting if not present
    if (!sortBy.includes('updatedAt')) {
        orderBy.push({ updatedAt: 'desc' })
    }

    const projects = await prisma.project.findMany({
        where,
        orderBy: orderBy,
        include: {
            followupTasks: {
                select: { isCompleted: true }
            }
        }
    })

    // Apply hasPendingTasks filter client-side (or using Prisma if refactored correctly)
    if (hasPendingTasks) {
        return projects.filter(project => project.followupTasks.some(task => !task.isCompleted));
    }

    return projects
}
