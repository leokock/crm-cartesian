'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  MapPin,
  Calendar,
  Ruler,
  Tag,
  Pencil,
  Trash2,
  Handshake,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ActivitySection } from '@/components/activities'
import { useProject, useDeleteProject } from '@/hooks/use-projects'
import { formatDate, formatArea } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'
import { useState } from 'react'

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>
}

const statusLabels = {
  active: 'Ativo',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const statusVariants = {
  active: 'default' as const,
  completed: 'secondary' as const,
  cancelled: 'destructive' as const,
}

const projectTypeLabels: Record<string, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  industrial: 'Industrial',
  misto: 'Misto',
  infraestrutura: 'Infraestrutura',
  outros: 'Outros',
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = use(params)
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: project, isLoading } = useProject(projectId)
  const deleteMutation = useDeleteProject()

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(projectId)
    router.push(ROUTES.PROJECTS)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Projeto não encontrado"
          description="O projeto que você está procurando não existe."
          backHref={ROUTES.PROJECTS}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={project.description || 'Projeto'}
        backHref={ROUTES.PROJECTS}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/projects/${projectId}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={statusVariants[project.status as keyof typeof statusVariants]}>
                {statusLabels[project.status as keyof typeof statusLabels]}
              </Badge>
            </div>
            {project.project_type && (
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>
                  {projectTypeLabels[project.project_type] || project.project_type}
                </span>
              </div>
            )}
            {project.area_m2 && (
              <div className="flex items-center gap-3">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span>{formatArea(project.area_m2)}</span>
              </div>
            )}
            {project.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{project.location}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {project.company ? (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Link
                  href={ROUTES.CLIENT_DETAIL(project.company.id)}
                  className="text-primary hover:underline"
                >
                  {project.company.name}
                </Link>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Nenhum cliente associado.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.start_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Início: {formatDate(project.start_date)}</span>
              </div>
            )}
            {project.expected_end_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Previsão de Término: {formatDate(project.expected_end_date)}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Criado em: {formatDate(project.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5" />
              Negócios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href={`/deals?project_id=${projectId}`}>
                Ver negócios deste projeto
              </Link>
            </Button>
          </CardContent>
        </Card>

        {project.description && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {project.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Atividades */}
      <ActivitySection projectId={projectId} />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Projeto"
        description={`Tem certeza que deseja excluir o projeto "${project.name}"? Os negócios associados também serão afetados.`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
