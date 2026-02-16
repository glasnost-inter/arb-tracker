// Forced reload: 2026-02-16T12:10:00
import { PrismaClient } from '@prisma/client'


const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
