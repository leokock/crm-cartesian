'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { FolderKanban, MoreHorizontal, Eye, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { SearchInput } from '@/components/shared/search-input'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DealFormDialog } from '@/components/pipeline/deal-form-dialog'
import { DealDetailSheet } from '@/components/pipeline/deal-detail-sheet'
import { useDeals, useDeleteDeal, useUpdateDealStatus } from '@/hooks/use-deals'
import { formatCurrency } from '@/lib/utils/format'
import type { DealWithRelations } from '@/services/deals.service'

export default function DealsPage() {
  const [search, setSearch] = useState('')
  const [deletingDeal, setDeletingDeal] = useState<DealWithRelations | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<DealWithRelations | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<DealWithRelations | null>(null)

  const { data: deals, isLoading } = useDeals({ search })
  const deleteMutation = useDeleteDeal()
  const updateStatusMutation = useUpdateDealStatus()

  const handleDelete = async () => {
    if (deletingDeal) {
      await deleteMutation.mutateAsync(deletingDeal.id)
      setDeletingDeal(null)
    }
  }

  const handleMarkAsWon = async (deal: DealWithRelations) => {
    await updateStatusMutation.mutateAsync({ id: deal.id, status: 'won' })
  }

  const handleMarkAsLost = async (deal: DealWithRelations) => {
    await updateStatusMutation.mutateAsync({ id: deal.id, status: 'lost' })
  }

  const columns: ColumnDef<DealWithRelations>[] = [
    {
      accessorKey: 'title',
      header: 'Título',
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedDeal(row.original)}
          className="font-medium hover:underline text-left"
        >
          {row.original.title}
        </button>
      ),
    },
    {
      accessorKey: 'company',
      header: 'Empresa',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.company?.name || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'stage',
      header: 'Estágio',
      cell: ({ row }) => {
        const stage = row.original.stage
        if (!stage) return '-'
        return (
          <Badge
            variant="outline"
            className="gap-1.5"
            style={{ borderColor: stage.color, color: stage.color }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            {stage.name}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'value',
      header: 'Valor',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.value ? formatCurrency(row.original.value) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'expected_close_date',
      header: 'Previsão',
      cell: ({ row }) => {
        const date = row.original.expected_close_date
        if (!date) return '-'
        return (
          <span className="text-muted-foreground">
            {new Date(date).toLocaleDateString('pt-BR')}
          </span>
        )
      },
    },
    {
      accessorKey: 'owner',
      header: 'Responsável',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.owner?.full_name || '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const deal = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedDeal(deal)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setEditingDeal(deal)
                setIsFormOpen(true)
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleMarkAsWon(deal)}
                className="text-green-600 focus:text-green-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como Ganho
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleMarkAsLost(deal)}
                className="text-orange-600 focus:text-orange-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Marcar como Perdido
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingDeal(deal)}
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

  if (!isLoading && (!deals || deals.length === 0) && !search) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Negócios"
          description="Gerencie suas oportunidades de vendas"
        />
        <EmptyState
          icon={FolderKanban}
          title="Nenhum negócio cadastrado"
          description="Comece criando seu primeiro negócio para acompanhar suas oportunidades de vendas."
          action={{
            label: 'Novo Negócio',
            onClick: () => setIsFormOpen(true),
          }}
        />
        <DealFormDialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open)
            if (!open) setEditingDeal(null)
          }}
          deal={editingDeal}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Negócios"
        description="Gerencie suas oportunidades de vendas"
        action={{
          label: 'Novo Negócio',
          onClick: () => setIsFormOpen(true),
        }}
      />

      <div className="flex items-center gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por título..."
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={deals || []}
        isLoading={isLoading}
        emptyMessage="Nenhum negócio encontrado"
      />

      <DealFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingDeal(null)
        }}
        deal={editingDeal}
      />

      <DealDetailSheet
        deal={selectedDeal}
        open={!!selectedDeal}
        onOpenChange={(open) => !open && setSelectedDeal(null)}
        onEdit={(deal) => {
          setSelectedDeal(null)
          setEditingDeal(deal)
          setIsFormOpen(true)
        }}
      />

      <ConfirmDialog
        open={!!deletingDeal}
        onOpenChange={(open) => !open && setDeletingDeal(null)}
        title="Excluir Negócio"
        description={`Tem certeza que deseja excluir o negócio "${deletingDeal?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
