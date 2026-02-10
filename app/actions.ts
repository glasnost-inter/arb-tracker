'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { calculateSlaTarget } from '@/lib/sla'
import { prisma } from '@/lib/prisma'

import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function submitProject(formData: FormData) {
    try {
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const ownerSquad = formData.get('ownerSquad') as string
        const pic = formData.get('pic') as string
        const type = formData.get('type') as string

        const docLink = formData.get('docLink') as string
        const submissionDateStr = formData.get('submissionDate') as string
        const reviewDateStr = formData.get('reviewDate') as string
        const decisionDateStr = formData.get('decisionDate') as string
        const status = formData.get('status') as string
        const decision = formData.get('decision') as string
        const mitigationNotes = formData.get('mitigationNotes') as string
        const slaDuration = parseInt(formData.get('slaDuration') as string) || 5

        // Parse dates or use defaults
        const submissionDate = submissionDateStr ? new Date(submissionDateStr) : new Date()
        const reviewDate = reviewDateStr ? new Date(reviewDateStr) : null
        const decisionDate = decisionDateStr ? new Date(decisionDateStr) : null

        // Calculate SLA Target: use configured duration
        const slaTarget = calculateSlaTarget(submissionDate, slaDuration)

        // Handle Attachments
        const files = formData.getAll('attachments') as File[]
        const savedAttachments = []

        if (files && files.length > 0) {
            const uploadDir = join(process.cwd(), 'public', 'uploads')
            // Ensure directory exists (node 10+)
            await import('fs').then(fs => fs.promises.mkdir(uploadDir, { recursive: true }))

            for (const file of files) {
                if (file.size > 0 && file.name !== 'undefined') {
                    const buffer = Buffer.from(await file.arrayBuffer())
                    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
                    const uploadPath = join(uploadDir, uniqueName)
                    await writeFile(uploadPath, buffer)
                    savedAttachments.push({
                        filename: file.name,
                        path: `/uploads/${uniqueName}`
                    })
                }
            }
        }

        await prisma.project.create({
            data: {
                name,
                description,
                ownerSquad,
                pic,
                type,
                docLink,
                submissionDate,
                reviewDate,
                decisionDate,
                slaDuration,
                slaTarget,
                status: status || 'Submitted',
                decision,
                mitigationNotes,
                attachments: {
                    create: savedAttachments
                }
            }
        })
    } catch (error) {
        console.error('Failed to submit project:', error)
        return { error: 'Failed to submit project: ' + (error instanceof Error ? error.message : String(error)) }
    }

    revalidatePath('/')
    redirect('/')
}

export async function updateProject(id: string, formData: FormData) {
    try {
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const ownerSquad = formData.get('ownerSquad') as string
        const pic = formData.get('pic') as string
        const type = formData.get('type') as string

        const docLink = formData.get('docLink') as string
        const submissionDateStr = formData.get('submissionDate') as string
        const reviewDateStr = formData.get('reviewDate') as string
        const decisionDateStr = formData.get('decisionDate') as string
        const status = formData.get('status') as string
        const decision = formData.get('decision') as string
        const mitigationNotes = formData.get('mitigationNotes') as string
        const slaDuration = parseInt(formData.get('slaDuration') as string) || 5

        // Parse dates or use defaults
        const submissionDate = submissionDateStr ? new Date(submissionDateStr) : new Date()
        const reviewDate = reviewDateStr ? new Date(reviewDateStr) : null
        const decisionDate = decisionDateStr ? new Date(decisionDateStr) : null

        // Calculate SLA Target: use configured duration
        const slaTarget = calculateSlaTarget(submissionDate, slaDuration)

        // Handle Attachments (Append new ones)
        const files = formData.getAll('attachments') as File[]
        const savedAttachments = []

        if (files && files.length > 0) {
            const uploadDir = join(process.cwd(), 'public', 'uploads')
            // Ensure directory exists (node 10+)
            await import('fs').then(fs => fs.promises.mkdir(uploadDir, { recursive: true }))

            for (const file of files) {
                if (file.size > 0 && file.name !== 'undefined') {
                    const buffer = Buffer.from(await file.arrayBuffer())
                    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
                    const uploadPath = join(uploadDir, uniqueName)
                    await writeFile(uploadPath, buffer)
                    savedAttachments.push({
                        filename: file.name,
                        path: `/uploads/${uniqueName}`
                    })
                }
            }
        }

        if (status === 'Archived') {
            // Get current project data including attachments
            const project = await prisma.project.findUnique({
                where: { id },
                include: { attachments: true }
            })

            if (!project) throw new Error("Project not found")

            // Transaction: Create ArchivedProject, Create ArchivedAttachments, Delete Project
            await prisma.$transaction(async (tx) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (tx as any).archivedProject.create({
                    data: {
                        id: project.id,
                        name: project.name,
                        description: project.description,
                        ownerSquad: project.ownerSquad,
                        pic: project.pic,
                        type: project.type,
                        docLink: project.docLink,
                        submissionDate: project.submissionDate,
                        reviewDate: project.reviewDate,
                        decisionDate: project.decisionDate,
                        status: 'Archived',
                        decision: project.decision,
                        mitigationNotes: project.mitigationNotes,
                        adrNumber: project.adrNumber,
                        notes: project.notes,
                        slaDuration: project.slaDuration,
                        slaTarget: project.slaTarget,
                        createdAt: project.createdAt,
                        updatedAt: project.updatedAt,
                        attachments: {
                            create: project.attachments.map(a => ({
                                id: a.id,
                                filename: a.filename,
                                path: a.path,
                                createdAt: a.createdAt
                            }))
                        }
                    }
                })

                await tx.project.delete({
                    where: { id }
                })
            })
        } else {
            // Fetch current data for comparison
            const currentProject = await prisma.project.findUnique({
                where: { id }
            })

            if (currentProject) {
                const changes: { field: string, old: string | null, new: string | null }[] = []

                // Helper to compare and add changes
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const checkChange = (field: string, oldValue: any, newValue: any) => {
                    // Handle dates
                    if (oldValue instanceof Date && newValue instanceof Date) {
                        if (oldValue.getTime() !== newValue.getTime()) {
                            changes.push({
                                field,
                                old: oldValue.toISOString().split('T')[0],
                                new: newValue.toISOString().split('T')[0]
                            })
                        }
                        return
                    }
                    // Handle other types
                    if (String(oldValue) !== String(newValue)) {
                        // Skip if both are falsy/empty
                        if (!oldValue && !newValue) return

                        changes.push({
                            field,
                            old: String(oldValue || ''),
                            new: String(newValue || '')
                        })
                    }
                }

                checkChange('Name', currentProject.name, name)
                checkChange('Description', currentProject.description, description)
                checkChange('Owner Squad', currentProject.ownerSquad, ownerSquad)
                checkChange('PIC', currentProject.pic, pic)
                checkChange('Type', currentProject.type, type)
                checkChange('Doc Link', currentProject.docLink, docLink)
                checkChange('Submission Date', currentProject.submissionDate, submissionDate)
                checkChange('Review Date', currentProject.reviewDate, reviewDate)
                checkChange('Decision Date', currentProject.decisionDate, decisionDate)
                checkChange('Status', currentProject.status, status)
                checkChange('Decision', currentProject.decision, decision)
                checkChange('Mitigation Notes', currentProject.mitigationNotes, mitigationNotes)
                checkChange('SLA Duration', currentProject.slaDuration, slaDuration)
                // Note: Attachments are harder to track diffs for in this simple logic, skipping for now or could add separate logic

                if (changes.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (prisma as any).projectHistory.create({
                        data: {
                            projectId: id,
                            changes: JSON.stringify(changes),
                            actor: 'System/User' // In a real auth system, this would be the user's name
                        }
                    })
                }
            }

            await prisma.project.update({
                where: { id },
                data: {
                    name,
                    description,
                    ownerSquad,
                    pic,
                    type,
                    docLink,
                    submissionDate,
                    reviewDate,
                    decisionDate,
                    slaDuration,
                    slaTarget,
                    status: status || 'Submitted',
                    decision,
                    mitigationNotes,
                    attachments: {
                        create: savedAttachments
                    }
                }
            })
        }
    } catch (error) {
        console.error('Failed to update project:', error)
        return { error: 'Failed to update project: ' + (error instanceof Error ? error.message : String(error)) }
    }

    revalidatePath('/')
    revalidatePath(`/submission/${id}`)
    redirect('/')
}

export async function getSquads() {
    return await prisma.squad.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function getProjectById(id: string) {
    try {
        console.log(`Fetching project with ID: ${id} (type: ${typeof id})`)
        const project = await prisma.project.findUnique({
            where: { id: String(id) },
            include: { attachments: true }
        })
        console.log('Project fetched:', project)
        return project
    } catch (error) {
        console.error('Error fetching project:', error)
        throw error
    }
}

export async function getDistinctDocLinks() {
    try {
        const projects = await prisma.project.findMany({
            select: { docLink: true },
            where: { docLink: { not: null } },
            distinct: ['docLink']
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const archivedProjects = await (prisma as any).archivedProject.findMany({
            select: { docLink: true },
            where: { docLink: { not: null } },
            distinct: ['docLink']
        })

        const links = new Set([
            ...projects.map(p => p.docLink).filter(Boolean),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...archivedProjects.map((p: any) => p.docLink).filter(Boolean)
        ])

        return Array.from(links).sort() as string[]
    } catch (error) {
        console.error('Error fetching doc links:', error)
        return []
    }
}

export async function getProjectHistory(projectId: string) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const history = await (prisma as any).projectHistory.findMany({
            where: { projectId },
            orderBy: { timestamp: 'desc' }
        })
        return history
    } catch (error) {
        console.error('Error fetching project history:', error)
        return []
    }
}
