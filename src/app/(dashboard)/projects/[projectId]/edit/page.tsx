'use client'

import { use } from 'react'
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { ProjectForm } from '@/components/projects/project-form'
import { Skeleton } from '@/components/ui/skeleton'
import { useProject } from '@/hooks/use-projects'
import { ROUTES } from '@/lib/constants/routes'

interface EditProjectPageProps {
  params: Promise<{ projectId: string }>
}

function EditProjectContent({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useProject(projectId)

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (!project) {
    return (
      <PageHeader
        title="Projeto não encontrado"
        description="O projeto que você está procurando não existe."
        backHref={ROUTES.PROJECTS}
      />
    )
  }

  return <ProjectForm project={project} />
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const { projectId } = use(params)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Projeto"
        description="Atualize as informações do projeto"
        backHref={ROUTES.PROJECT_DETAIL(projectId)}
      />
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <EditProjectContent projectId={projectId} />
      </Suspense>
    </div>
  )
}
