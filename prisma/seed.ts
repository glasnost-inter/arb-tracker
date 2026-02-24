import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const squads = [
    'All - Squad',
    'AO - Claim',
    'AO - Digital Care',
    'AO - Fraud',
    'AO - Lifehub',
    'AO - NB',
    'AO - PS',
    'Core - AAS',
    'Core - DCMS',
    'Core - Legacy',
    'Core - PAS',
    'Core - Product Engine',
    'Customer - DPLK',
    'Customer - IFGID',
    'Customer - IFGPay',
    'Customer - Life By IFG',
    'Customer - Lifeforce',
    'Customer - Lifespace',
    'Customer - Marketing',
    'Customer - One By IFG',
    'Customer - Partnership',
    'Data',
    'Finance',
    'IT & Architect - Architect',
    'IT & Architect - Development',
    'IT & Architect - Infra.'
]

async function main() {
    console.log(`Start seeding ...`)

    // Clean up existing squads to remove truncated/incorrect entries
    await prisma.squad.deleteMany()
    console.log('Deleted existing squads.')

    for (const squad of squads) {
        const s = await prisma.squad.create({
            data: {
                name: squad,
            },
        })
        console.log(`Created squad with id: ${s.id}`)
    }
    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
