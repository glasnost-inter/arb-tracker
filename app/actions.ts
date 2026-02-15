'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { calculateSlaTarget } from '@/lib/sla'
import { prisma } from '@/lib/prisma'

import { writeFile, copyFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

async function backupDatabase() {
    const dbPath = join(process.cwd(), 'dev.db')
    const backupDir = join(process.cwd(), 'backups')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = join(backupDir, `dev_backup_${timestamp}.db`)

    try {
        if (!existsSync(backupDir)) {
            await mkdir(backupDir, { recursive: true })
        }
        if (existsSync(dbPath)) {
            await copyFile(dbPath, backupPath)
            console.log(`Database backed up to ${backupPath}`)
        }
    } catch (error) {
        console.error('Database backup failed:', error)
        // We don't throw here to avoid blocking archival if backup fails, 
        // but in a production system we might want to be stricter.
    }
}

export async function submitProject(formData: FormData) {
    try {
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const ownerSquad = formData.get('ownerSquad') as string
        const pic = formData.get('pic') as string
        const type = formData.get('type') as string

        // const docLink = formData.get('docLink') as string // Legacy
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
            const uploadDir = join(process.cwd(), 'public', 'attachments')
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
                        path: `/attachments/${uniqueName}`
                    })
                }
            }
        }

        // Create doc links
        const docLinks = formData.getAll('docLinks') as string[]
        const docLinksData = docLinks.filter(link => link.trim() !== '').map(link => ({ url: link }))

        // Parse Follow-up Tasks
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tasks: any[] = []
        let taskIndex = 0
        while (true) {
            const description = formData.get(`tasks[${taskIndex}].description`)
            if (description === null) break

            const dueDateStr = formData.get(`tasks[${taskIndex}].dueDate`) as string
            const isCompletedStr = formData.get(`tasks[${taskIndex}].isCompleted`) as string

            if (description) {
                tasks.push({
                    description: description as string,
                    dueDate: new Date(dueDateStr),
                    isCompleted: isCompletedStr === 'true'
                })
            }
            taskIndex++
        }

        await prisma.project.create({
            data: {
                name,
                description,
                ownerSquad,
                pic,
                type,
                docLinks: {
                    create: docLinksData
                },
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
                },
                followupTasks: {
                    create: tasks
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
        const docLinks = formData.getAll('docLinks') as string[]

        // const docLink = formData.get('docLink') as string // Legacy
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
        const captions = formData.getAll('attachment_captions') as string[]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const savedAttachments: any[] = []

        if (files && files.length > 0) {
            const uploadDir = join(process.cwd(), 'public', 'attachments')
            // Ensure directory exists
            await import('fs').then(fs => fs.promises.mkdir(uploadDir, { recursive: true }))

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const caption = captions[i] || ''
                if (file.size > 0 && file.name !== 'undefined') {
                    const buffer = Buffer.from(await file.arrayBuffer())
                    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
                    const uploadPath = join(uploadDir, uniqueName)
                    await writeFile(uploadPath, buffer)
                    savedAttachments.push({
                        filename: file.name,
                        path: `/attachments/${uniqueName}`,
                        caption
                    })
                }
            }
        }

        if (status === 'Archived') {
            // Get current project data including attachments and tasks
            const project = await prisma.project.findUnique({
                where: { id },
                include: {
                    attachments: true,
                    followupTasks: true,
                    docLinks: true
                }
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
                        // docLink removed
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
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                mimeType: (a as any).mimeType, // Transfer mimeType
                                createdAt: a.createdAt
                            }))
                        },
                        followupTasks: {
                            create: project.followupTasks.map(t => ({
                                id: t.id,
                                description: t.description,
                                isCompleted: t.isCompleted,
                                dueDate: t.dueDate,
                                createdAt: t.createdAt,
                                updatedAt: t.updatedAt
                            }))
                        },
                        docLinks: {
                            create: project.docLinks.map(d => ({
                                url: d.url
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
                where: { id },
                include: { docLinks: true }
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

                const oldDocLinks = currentProject.docLinks.map(l => l.url).sort().join(', ')
                const newDocLinksStr = docLinks.filter(l => l.trim() !== '').sort().join(', ')
                checkChange('Documentation Links', oldDocLinks, newDocLinksStr)
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

            // Handle Doc Links Update (Replace all strategy)

            // Create new links data
            const docLinksData = docLinks.filter(link => link.trim() !== '').map(link => ({ url: link }))

            // Delete existing links
            await prisma.documentationLink.deleteMany({
                where: { projectId: id }
            })

            // Parse Follow-up Tasks
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const submittedTasks: any[] = []
            let taskIndex = 0
            while (true) {
                const description = formData.get(`tasks[${taskIndex}].description`)
                if (description === null) break

                const dueDateStr = formData.get(`tasks[${taskIndex}].dueDate`) as string
                const id = formData.get(`tasks[${taskIndex}].id`) as string
                const isCompletedStr = formData.get(`tasks[${taskIndex}].isCompleted`) as string

                if (description) {
                    submittedTasks.push({
                        id: id || undefined,
                        description: description as string,
                        dueDate: new Date(dueDateStr),
                        isCompleted: isCompletedStr === 'true'
                    })
                }
                taskIndex++
            }

            // Sync Tasks: Delete missing, Update existing, Create new
            // We can simple delete all and recreate, but that loses history/IDs if we care.
            // Better: 
            // 1. Identify IDs in submittedTasks.
            // 2. Delete tasks in DB specifically for this project that are NOT in submitted IDs.
            // 3. Upsert (or Update/Create) the submitted tasks.

            // To do this cleanly in a transaction or separate calls:
            const submittedIds = submittedTasks.filter(t => t.id).map(t => t.id)

            await prisma.followupTask.deleteMany({
                where: {
                    projectId: id,
                    id: { notIn: submittedIds }
                }
            })

            for (const task of submittedTasks) {
                if (task.id) {
                    await prisma.followupTask.update({
                        where: { id: task.id },
                        data: {
                            description: task.description,
                            dueDate: task.dueDate,
                            isCompleted: task.isCompleted
                        }
                    })
                } else {
                    await prisma.followupTask.create({
                        data: {
                            projectId: id,
                            description: task.description,
                            dueDate: task.dueDate,
                            isCompleted: task.isCompleted
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
                    docLinks: {
                        create: docLinksData
                    },
                    submissionDate,
                    reviewDate,
                    decisionDate,
                    slaDuration,
                    slaTarget,
                    status,
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
            include: {
                attachments: true,
                docLinks: true,
                followupTasks: {
                    include: {
                        attachments: true
                    }
                }
            }
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
        const links = await prisma.documentationLink.findMany({
            select: { url: true },
            distinct: ['url']
        })

        const archivedLinks = await prisma.archivedDocumentationLink.findMany({
            select: { url: true },
            distinct: ['url']
        })

        const allLinks = new Set([
            ...links.map(l => l.url),
            ...archivedLinks.map(l => l.url)
        ])

        return Array.from(allLinks).sort()
    } catch (error) {
        console.error('Error fetching doc links:', error)
        return []
    }
}

export async function getProjectHistory(projectId: string): Promise<import('@prisma/client').ProjectHistory[]> {
    try {
        const history = await prisma.projectHistory.findMany({
            where: { projectId },
            orderBy: { timestamp: 'desc' }
        })
        return history
    } catch (error) {
        console.error('Error fetching project history:', error)
        return []
    }
}

// Helper to save files
async function saveFiles(formData: FormData) {
    const files = formData.getAll('attachments') as File[]
    const captions = formData.getAll('attachment_captions') as string[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const savedAttachments: any[] = []

    if (files && files.length > 0) {
        const uploadDir = join(process.cwd(), 'public', 'attachments')
        // Ensure directory exists (node 10+)
        await import('fs').then(fs => fs.promises.mkdir(uploadDir, { recursive: true }))

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const caption = captions[i] || ''
            if (file.size > 0 && file.name !== 'undefined') {
                const buffer = Buffer.from(await file.arrayBuffer())
                const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
                const uploadPath = join(uploadDir, uniqueName)
                await writeFile(uploadPath, buffer)

                // Determine mimeType
                let mimeType = file.type
                if ((!mimeType || mimeType === 'application/octet-stream') && file.name.endsWith('.drawio')) {
                    mimeType = 'application/vnd.jgraph.mxfile'
                }
                if (!mimeType) mimeType = 'application/octet-stream'

                savedAttachments.push({
                    filename: file.name,
                    path: `/attachments/${uniqueName}`,
                    caption,
                    mimeType
                })
            }
        }
    }
    return savedAttachments
}

export async function submitSideQuest(formData: FormData) {
    try {
        const questName = formData.get('questName') as string || 'Untitled Quest'
        const instruction = formData.get('instruction') as string
        const impactScore = parseInt(formData.get('impactScore') as string)
        const dueDateStr = formData.get('dueDate') as string
        const dueDate = new Date(dueDateStr)

        const requestDateStr = formData.get('requestDate') as string
        const requestDate = requestDateStr ? new Date(requestDateStr) : new Date()

        const finishDateStr = formData.get('finishDate') as string
        const finishDate = finishDateStr ? new Date(finishDateStr) : null

        const requestor = formData.get('requestor') as string || 'Unknown'
        const executor = formData.get('executor') as string || null
        const status = formData.get('status') as string || 'Submited'

        if (!instruction || !impactScore || !dueDateStr) {
            return { error: 'Missing required fields' }
        }

        // Generate Ticket Code
        const ticketCode = `SQ-${Date.now().toString().slice(-6)}`

        // Handle Attachments
        const savedAttachments = await saveFiles(formData)

        // Save to DB
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const quest = await (prisma as any).sideQuest.create({
            data: {
                ticketCode,
                questName,
                instruction,
                requestDate,
                requestor,
                executor,
                dueDate,
                finishDate,
                impactScore,
                status,
                attachments: {
                    create: savedAttachments
                }
            }
        })

        revalidatePath('/side-quest')
        return { success: true, ticketCode, id: quest.id }
    } catch (error) {
        console.error('Failed to submit side quest:', error)
        return { error: 'Failed to submit side quest' }
    }
}

export async function getSideQuests(status?: string) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {}
        if (status) where.status = status

        const quests = await prisma.sideQuest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { attachments: true }
        })
        return quests
    } catch (error) {
        console.error('Failed to fetch side quests:', error)
        return []
    }
}

export async function getSideQuestById(id: string) {
    try {
        const quest = await prisma.sideQuest.findUnique({
            where: { id },
            include: {
                followUps: {
                    orderBy: { date: 'desc' },
                    include: { attachments: true }
                },
                attachments: true
            }
        })
        return quest
    } catch (error) {
        console.error('Failed to fetch side quest:', error)
        return null
    }
}

export async function addSideQuestFollowUp(formData: FormData) {
    try {
        const sideQuestId = formData.get('sideQuestId') as string
        const action = formData.get('action') as string
        const dateStr = formData.get('date') as string
        const date = dateStr ? new Date(dateStr) : new Date()

        if (!sideQuestId || !action) {
            return { error: 'Missing required fields' }
        }

        // Handle Attachments
        const savedAttachments = await saveFiles(formData)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).sideQuestFollowUp.create({
            data: {
                sideQuestId,
                action,
                date,
                attachments: {
                    create: savedAttachments
                }
            }
        })

        revalidatePath(`/side-quest/${sideQuestId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Failed to add side quest follow-up:', error)
        return { error: `Follow-up creation failed: ${error.message || 'Unknown database error'}` }
    }
}

export async function updateFollowupTask(taskId: string, formData: FormData) {
    try {
        const isCompleted = formData.get('isCompleted') === 'true'
        // Handle Attachments
        const savedAttachments = await saveFiles(formData)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).followupTask.update({
            where: { id: taskId },
            data: {
                isCompleted,
                attachments: {
                    create: savedAttachments
                }
            }
        })

        revalidatePath('/')
        // We can't easily revalidate the specific project page without ID, but revalidatePath('/') helps list pages.
        // The caller (client component) should probably trigger a router.refresh() or we need the projectId to be passed or fetched.
        // Let's fetch project ID to revalidate the detail page correctly.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const task = await (prisma as any).followupTask.findUnique({
            where: { id: taskId },
            select: { projectId: true }
        })
        if (task) {
            revalidatePath(`/submission/${task.projectId}`)
        }

        return { success: true }
    } catch (error) {
        console.error('Failed to update follow-up task:', error)
        return { error: 'Failed to update follow-up task' }
    }
}

export async function updateSideQuestStatus(sideQuestId: string, status: string) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).sideQuest.update({
            where: { id: sideQuestId },
            data: { status }
        })

        revalidatePath(`/side-quest/${sideQuestId}`)
        revalidatePath('/side-quest')
        return { success: true }
    } catch (error) {
        console.error('Failed to update side quest status:', error)
        return { error: 'Failed to update side quest status' }
    }
}

export async function archiveSideQuest(sideQuestId: string) {
    try {
        const quest = await prisma.sideQuest.findUnique({
            where: { id: sideQuestId },
            include: {
                attachments: true,
                followUps: {
                    include: {
                        attachments: true
                    }
                }
            }
        })

        if (!quest) throw new Error("Side Quest not found")

        // 0. Backup database before destructive operation (Charter Requirement)
        await backupDatabase()

        await prisma.$transaction(async (tx) => {
            // 1. Create ArchivedSideQuest
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const archivedQuest = await (tx as any).archivedSideQuest.create({
                data: {
                    id: quest.id,
                    ticketCode: quest.ticketCode,
                    questName: quest.questName,
                    instruction: quest.instruction,
                    requestDate: quest.requestDate,
                    requestor: quest.requestor,
                    executor: quest.executor,
                    dueDate: quest.dueDate,
                    finishDate: quest.finishDate,
                    impactScore: quest.impactScore,
                    status: 'Archived',
                    createdAt: quest.createdAt,
                    archivedAt: new Date()
                }
            })

            // 2. Create ArchivedSideQuestFollowUps and their attachments
            for (const fu of quest.followUps) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const archivedFu = await (tx as any).archivedSideQuestFollowUp.create({
                    data: {
                        id: fu.id,
                        sideQuestId: archivedQuest.id,
                        date: fu.date,
                        action: fu.action,
                        createdAt: fu.createdAt
                    }
                })

                if (fu.attachments && fu.attachments.length > 0) {
                    for (const a of fu.attachments) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await (tx as any).archivedAttachment.create({
                            data: {
                                id: a.id,
                                filename: a.filename,
                                path: a.path,
                                caption: (a as any).caption,
                                mimeType: (a as any).mimeType,
                                createdAt: a.createdAt,
                                sideQuestFollowUpId: archivedFu.id
                            }
                        })
                    }
                }
            }

            // 3. Create ArchivedAttachments for the main quest (polymorphic)
            if (quest.attachments && quest.attachments.length > 0) {
                for (const a of quest.attachments) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (tx as any).archivedAttachment.create({
                        data: {
                            id: a.id,
                            filename: a.filename,
                            path: a.path,
                            caption: (a as any).caption,
                            mimeType: (a as any).mimeType,
                            createdAt: a.createdAt,
                            sideQuestId: archivedQuest.id
                        }
                    })
                }
            }

            // 4. Delete the original SideQuest (cascade deletes follow-ups and active attachments)
            await tx.sideQuest.delete({
                where: { id: sideQuestId }
            })
        })

        revalidatePath('/side-quest')
        return { success: true }
    } catch (error) {
        console.error('Failed to archive side quest:', error)
        return { error: 'Failed to archive side quest' }
    }
}
