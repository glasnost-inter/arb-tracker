import Link from 'next/link'
import { getSlaComplianceStatus, SlaStatus } from '@/lib/sla'
import { prisma } from '@/lib/prisma'
import ProjectFilters from './components/ProjectFilters'
import { Container } from './components/ui/Container'
import { Button } from './components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './components/ui/Card'
import { Badge } from './components/ui/Badge'

// Define a type for the project structure we need
type Project = {
  id: string
  name: string
  ownerSquad: string
  pic: string
  type: string
  docLink: string | null
  submissionDate: Date
  reviewDate: Date | null
  status: string
  decision: string | null
  adrNumber: string | null
  notes: string | null
  slaTarget: Date
  createdAt: Date
  updatedAt: Date
}

async function getProjects(status?: string, decision?: string): Promise<Project[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (status) where.status = status
  if (decision) where.decision = decision

  const projects = await prisma.project.findMany({
    where,
    orderBy: { submissionDate: 'desc' }
  })
  return projects
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams
  const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined
  const decision = typeof resolvedSearchParams.decision === 'string' ? resolvedSearchParams.decision : undefined

  const projects = await getProjects(status, decision)

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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ARB Tracker Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button variant="outline">Admin</Button>
            </Link>
            <Link href="/submission">
              <Button>New Submission</Button>
            </Link>
          </div>
        </div>

        <ProjectFilters />

        <div className="space-y-4">
          {projects.map((project) => {
            const slaStatus = getSlaStatus(project)
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
                    <Badge variant="outline" className="text-base font-normal px-3 py-1">
                      {project.status}
                    </Badge>
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
            <div className="text-center py-12 bg-card rounded-lg border border-dashed">
              <p className="text-muted-foreground">No submissions found matching your filters.</p>
              <Button variant="link" className="mt-2">Clear all filters</Button>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
