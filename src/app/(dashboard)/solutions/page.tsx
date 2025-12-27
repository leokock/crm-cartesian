'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { SolutionFormDialog } from '@/components/solutions/solution-form-dialog'
import {
  useSolutions,
  useDeleteSolution,
  useToggleSolutionActive,
} from '@/hooks/use-solutions'
import { formatCurrency } from '@/lib/utils/format'
import type { Database } from '@/types/database.types'

type Solution = Database['public']['Tables']['solutions']['Row']

export default function SolutionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null)
  const [deletingSolution, setDeletingSolution] = useState<Solution | null>(null)

  const { data: solutions, isLoading } = useSolutions()
  const deleteMutation = useDeleteSolution()
  const toggleActiveMutation = useToggleSolutionActive()

  const handleEdit = (solution: Solution) => {
    setEditingSolution(solution)
    setIsFormOpen(true)
  }

  const handleDelete = async () => {
    if (deletingSolution) {
      await deleteMutation.mutateAsync(deletingSolution.id)
      setDeletingSolution(null)
    }
  }

  const handleToggleActive = async (solution: Solution) => {
    await toggleActiveMutation.mutateAsync({
      id: solution.id,
      isActive: !solution.is_active,
    })
  }

  const columns: ColumnDef<Solution>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.is_system && (
            <Badge variant="secondary" className="text-xs">
              Sistema
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      cell: ({ row }) => (
        <span className="text-muted-foreground line-clamp-1">
          {row.original.description || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'base_price',
      header: 'Preço Base',
      cell: ({ row }) => (
        <span>
          {row.original.base_price
            ? formatCurrency(row.original.base_price)
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Ativo',
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_active}
          onCheckedChange={() => handleToggleActive(row.original)}
          disabled={toggleActiveMutation.isPending}
        />
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const solution = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(solution)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {!solution.is_system && (
                <DropdownMenuItem
                  onClick={() => setDeletingSolution(solution)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingSolution(null)
  }

  if (!isLoading && (!solutions || solutions.length === 0)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Soluções"
          description="Gerencie os produtos e serviços oferecidos"
        />
        <EmptyState
          icon={Package}
          title="Nenhuma solução cadastrada"
          description="As soluções padrão serão criadas automaticamente quando você criar sua organização."
          action={{
            label: 'Nova Solução',
            onClick: () => setIsFormOpen(true),
          }}
        />
        <SolutionFormDialog
          open={isFormOpen}
          onOpenChange={handleFormClose}
          solution={editingSolution}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Soluções"
        description="Gerencie os produtos e serviços oferecidos"
        action={{
          label: 'Nova Solução',
          onClick: () => setIsFormOpen(true),
        }}
      />

      <DataTable
        columns={columns}
        data={solutions || []}
        isLoading={isLoading}
        emptyMessage="Nenhuma solução encontrada"
      />

      <SolutionFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        solution={editingSolution}
      />

      <ConfirmDialog
        open={!!deletingSolution}
        onOpenChange={(open) => !open && setDeletingSolution(null)}
        title="Excluir Solução"
        description={`Tem certeza que deseja excluir a solução "${deletingSolution?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
