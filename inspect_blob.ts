
import { PrismaClient } from '@prisma/client'
import path from 'path'

const dbPath = path.join(process.cwd(), 'restored_blob.db')
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${dbPath}`,
        },
    },
})

async function main() {
    console.log(`Inspecting restored blob (225KB) at: ${dbPath}`)

    try {
        const projectCount = await prisma.project.count()
        const attachmentCount = await prisma.attachment.count()
        const followUpCount = await prisma.followupTask.count()

        const imagePng = await prisma.attachment.findFirst({ where: { filename: 'image.png' } })

        console.log('--- Restored Blob Stats ---')
        console.log(`Projects: ${projectCount}`)
        console.log(`Attachments: ${attachmentCount}`)
        console.log(`FollowupTasks: ${followUpCount}`)

        if (imagePng) console.log(`✅ Found 'image.png' in restored blob!`)
        else console.log(`❌ 'image.png' NOT found.`)

        if (projectCount > 0) {
            const projects = await prisma.project.findMany({ take: 3 })
            console.log('Sample Projects:', projects.map(p => p.name))
        }

    } catch (e) {
        console.error("Error reading restored blob (likely schema mismatch):", e.message)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
