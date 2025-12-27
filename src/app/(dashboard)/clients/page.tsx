'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Building2, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
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
import { DataTable } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { SearchInput } from '@/components/shared/search-input'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useClients, useDeleteClient } from '@/hooks/use-clients'
import { formatPhone } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'

interface ClientWithRelations {
  id: string
  name: string
  cnpj: string | null
  industry: string | null
  phone: string | null
  tags: string[]
  owner: { id: string; full_name: string | null; avatar_url: string | null } | null
  projects: { count: number }[]
}

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [deletingClient, setDeletingClient] = useState<ClientWithRelations | null>(null)
  const router = useRouter()

  const { data: clients, isLoading } = useClients({ search })
  const deleteMutation = useDeleteClient()

  const handleDelete = async () => {
    if (deletingClient) {
      await deleteMutation.mutateAsync(deletingClient.id)
      setDeletingClient(null)
    }
  }

  const columns: ColumnDef<ClientWithRelations>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <Link
          href={ROUTES.CLIENT_DETAIL(row.original.id)}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'cnpj',
      header: 'CNPJ',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.cnpj || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'industry',
      header: 'Setor',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.industry || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.phone ? formatPhone(row.original.phone) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'projects',
      header: 'Projetos',
      cell: ({ row }) => {
        const count = row.original.projects?.[0]?.count || 0
        return (
          <Badge variant="secondary">
            {count} {count === 1 ? 'projeto' : 'projetos'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.original.tags || []
        if (tags.length === 0) return '-'
        return (
          <div className="flex gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const client = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={ROUTES.CLIENT_DETAIL(client.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/clients/${client.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingClient(client)}
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

  if (!isLoading && (!clients || clients.length === 0) && !search) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Clientes"
          description="Gerencie os clientes da sua empresa"
        />
        <EmptyState
          icon={Building2}
          title="Nenhum cliente cadastrado"
          description="Comece cadastrando seu primeiro cliente para criar projetos e oportunidades de negócio."
          action={{
            label: 'Novo Cliente',
            href: ROUTES.CLIENT_NEW,
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie os clientes da sua empresa"
        action={{
          label: 'Novo Cliente',
          href: ROUTES.CLIENT_NEW,
        }}
      />

      <div className="flex items-center gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome ou CNPJ..."
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={(clients as ClientWithRelations[]) || []}
        isLoading={isLoading}
        emptyMessage="Nenhum cliente encontrado"
      />

      <ConfirmDialog
        open={!!deletingClient}
        onOpenChange={(open) => !open && setDeletingClient(null)}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente "${deletingClient?.name}"? Os projetos e negócios associados também serão afetados.`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
