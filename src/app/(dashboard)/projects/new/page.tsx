import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { ProjectForm } from '@/components/projects/project-form'
import { ROUTES } from '@/lib/constants/routes'

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Projeto"
        description="Cadastre um novo projeto vinculado a um cliente"
        backHref={ROUTES.PROJECTS}
      />
      <Suspense>
        <ProjectForm />
      </Suspense>
    </div>
  )
}
