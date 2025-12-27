'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Users, MoreHorizontal, Eye, Pencil, Trash2, Mail, Phone } from 'lucide-react'
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
import { useContacts, useDeleteContact } from '@/hooks/use-contacts'
import { ROUTES } from '@/lib/constants/routes'

interface ContactWithRelations {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  job_title: string | null
  tags: string[]
  company: { id: string; name: string } | null
  owner: { id: string; full_name: string | null } | null
}

export default function ContactsPage() {
  const [search, setSearch] = useState('')
  const [deletingContact, setDeletingContact] = useState<ContactWithRelations | null>(null)
  const router = useRouter()

  const { data: contacts, isLoading } = useContacts({ search })
  const deleteMutation = useDeleteContact()

  const handleDelete = async () => {
    if (deletingContact) {
      await deleteMutation.mutateAsync(deletingContact.id)
      setDeletingContact(null)
    }
  }

  const columns: ColumnDef<ContactWithRelations>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <Link
          href={ROUTES.CONTACT_DETAIL(row.original.id)}
          className="font-medium hover:underline"
        >
          {row.original.first_name} {row.original.last_name}
        </Link>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) =>
        row.original.email ? (
          <a
            href={`mailto:${row.original.email}`}
            className="flex items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <Mail className="h-3 w-3" />
            {row.original.email}
          </a>
        ) : (
          '-'
        ),
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      cell: ({ row }) =>
        row.original.phone ? (
          <a
            href={`tel:${row.original.phone}`}
            className="flex items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <Phone className="h-3 w-3" />
            {row.original.phone}
          </a>
        ) : (
          '-'
        ),
    },
    {
      accessorKey: 'job_title',
      header: 'Cargo',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.job_title || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'company',
      header: 'Empresa',
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
        const contact = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={ROUTES.CONTACT_DETAIL(contact.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/contacts/${contact.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingContact(contact)}
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

  if (!isLoading && (!contacts || contacts.length === 0) && !search) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Contatos"
          description="Gerencie os contatos dos seus clientes"
        />
        <EmptyState
          icon={Users}
          title="Nenhum contato cadastrado"
          description="Cadastre contatos para associá-los aos seus negócios e manter o relacionamento."
          action={{
            label: 'Novo Contato',
            href: ROUTES.CONTACT_NEW,
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contatos"
        description="Gerencie os contatos dos seus clientes"
        action={{
          label: 'Novo Contato',
          href: ROUTES.CONTACT_NEW,
        }}
      />

      <div className="flex items-center gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome ou email..."
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={(contacts as ContactWithRelations[]) || []}
        isLoading={isLoading}
        emptyMessage="Nenhum contato encontrado"
      />

      <ConfirmDialog
        open={!!deletingContact}
        onOpenChange={(open) => !open && setDeletingContact(null)}
        title="Excluir Contato"
        description={`Tem certeza que deseja excluir o contato "${deletingContact?.first_name} ${deletingContact?.last_name}"?`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
