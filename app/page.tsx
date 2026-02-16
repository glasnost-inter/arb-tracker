import Link from 'next/link'
import { getSlaComplianceStatus, SlaStatus } from '@/lib/sla'
import { prisma } from '@/lib/prisma'
import ProjectFilters from './components/ProjectFilters'
import { Container } from './components/ui/Container'
import { Button } from './components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './components/ui/Card'
import { Badge } from './components/ui/Badge'
import { ClipboardList, CheckCircle, PlusCircle } from 'lucide-react'

// Define a type for the project structure we need
type Project = {
  id: string
  name: string
  ownerSquad: string
  pic: string
  type: string
  submissionDate: Date
  reviewDate: Date | null
  status: string
  decision: string | null
  adrNumber: string | null
  notes: string | null
  slaTarget: Date
  createdAt: Date
  updatedAt: Date
  followupTasks: { isCompleted: boolean }[]
}

import { getDashboardProjects, DashboardParamsSchema } from '@/lib/dashboard-service'

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams

  // Use Zod for validation
  const params = DashboardParamsSchema.parse(resolvedSearchParams)

  const projects = await getDashboardProjects(params)

  const getSlaBadgeVariant = (status: SlaStatus) => {
    switch (status) {
      case 'Completed': return 'completed'
      case 'Breached': return 'breached'
      case 'Warning': return 'warning'
      case 'Safe': return 'safe'
      default: return 'default'
    }
  }

  const getSlaStatus = (project: Project): SlaStatus => {
    const isCompleted = project.status === 'Approved' || project.status === 'Rejected'
    return getSlaComplianceStatus(project.slaTarget, isCompleted)
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <Container>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-[#0052D4] to-[#4364F7] bg-clip-text text-transparent">ARB Tracker Dashboard</h1>
          <Link href="/submission">
            <Button className="flex gap-2 font-bold shadow-lg bg-gradient-to-r from-[#0052D4] to-[#4364F7] hover:opacity-90 transition-opacity">
              <PlusCircle className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        <ProjectFilters />

        <div className="space-y-4">
          {projects.map((project) => {
            const slaStatus = getSlaStatus(project)
            const pendingTasks = project.followupTasks.filter(t => !t.isCompleted).length
            const completedTasks = project.followupTasks.filter(t => t.isCompleted).length

            return (
              <Card key={project.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-primary">
                        <Link href={`/submission/${project.id}`} className="hover:underline">
                          {project.name}
                        </Link>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.ownerSquad} • {project.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {completedTasks > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1 font-normal bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                          <CheckCircle className="h-3 w-3" />
                          {completedTasks} Done
                        </Badge>
                      )}
                      {pendingTasks > 0 && (
                        <Badge variant="destructive" className="flex items-center gap-1 font-normal">
                          <ClipboardList className="h-3 w-3" />
                          {pendingTasks} Tasks
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-base font-normal px-3 py-1">
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {project.decision && (
                      <div>
                        <span className="font-semibold text-foreground">Decision:</span> <span className="text-muted-foreground">{project.decision}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">SLA Target:</span>
                      <Badge variant={getSlaBadgeVariant(slaStatus)}>
                        {project.slaTarget.toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-end gap-2">
                  <Link href={`/submission/${project.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <Link href={`/submission/${project.id}`}>
                    <Button variant="secondary" size="sm">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
          {projects.length === 0 && (
            <div className="text-center py-12 bg-card rounded-lg border border-border/50 border-dashed">
              <p className="text-muted-foreground font-medium">No projects found with current filter. Please adjust your criteria.</p>
              <Link href="/">
                <Button variant="link" className="mt-2 text-primary">
                  Clear all filters
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

