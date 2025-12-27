'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ClipboardList, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { SearchInput } from '@/components/shared/search-input'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useProjects, useDeleteProject } from '@/hooks/use-projects'
import { formatArea, formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'

interface ProjectWithRelations {
  id: string
  name: string
  status: 'active' | 'completed' | 'cancelled'
  project_type: string | null
  area_m2: number | null
  location: string | null
  created_at: string
  company: { id: string; name: string } | null
  owner: { id: string; full_name: string | null } | null
  deals: { count: number }[]
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

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [deletingProject, setDeletingProject] = useState<ProjectWithRelations | null>(null)
  const router = useRouter()

  const { data: projects, isLoading } = useProjects({
    search,
    status: statusFilter as 'active' | 'completed' | 'cancelled' | undefined,
  })
  const deleteMutation = useDeleteProject()

  const handleDelete = async () => {
    if (deletingProject) {
      await deleteMutation.mutateAsync(deletingProject.id)
      setDeletingProject(null)
    }
  }

  const columns: ColumnDef<ProjectWithRelations>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <Link
          href={ROUTES.PROJECT_DETAIL(row.original.id)}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'company',
      header: 'Cliente',
      cell: ({ row }) =>
        row.original.company ? (
          <Link
            href={ROUTES.CLIENT_DETAIL(row.original.company.id)}
            className="text-muted-foreground hover:underline"
          >
            {row.original.company.name}
          </Link>
        ) : (
          '-'
        ),
    },
    {
      accessorKey: 'project_type',
      header: 'Tipo',
      cell: ({ row }) => (
        <span className="text-muted-foreground capitalize">
          {row.original.project_type || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'area_m2',
      header: 'Área',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.area_m2 ? formatArea(row.original.area_m2) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusVariants[row.original.status]}>
          {statusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: 'deals',
      header: 'Negócios',
      cell: ({ row }) => {
        const count = row.original.deals?.[0]?.count || 0
        return (
          <span className="text-muted-foreground">
            {count} {count === 1 ? 'negócio' : 'negócios'}
          </span>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Criado em',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const project = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={ROUTES.PROJECT_DETAIL(project.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/projects/${project.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingProject(project)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (!isLoading && (!projects || projects.length === 0) && !search && !statusFilter) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Projetos"
          description="Gerencie os projetos dos seus clientes"
        />
        <EmptyState
          icon={ClipboardList}
          title="Nenhum projeto cadastrado"
          description="Crie projetos vinculados a clientes para organizar suas oportunidades de negócio."
          action={{
            label: 'Novo Projeto',
            href: ROUTES.PROJECT_NEW,
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projetos"
        description="Gerencie os projetos dos seus clientes"
        action={{
          label: 'Novo Projeto',
          href: ROUTES.PROJECT_NEW,
        }}
      />

      <div className="flex flex-wrap items-center gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome ou localização..."
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={(projects as ProjectWithRelations[]) || []}
        isLoading={isLoading}
        emptyMessage="Nenhum projeto encontrado"
      />

      <ConfirmDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        title="Excluir Projeto"
        description={`Tem certeza que deseja excluir o projeto "${deletingProject?.name}"? Os negócios associados também serão afetados.`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
