'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Phone,
  Smartphone,
  Building2,
  Briefcase,
  Tag,
  Calendar,
  Pencil,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ActivitySection } from '@/components/activities'
import { useContact, useDeleteContact } from '@/hooks/use-contacts'
import { formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'
import { useState } from 'react'

interface ContactDetailPageProps {
  params: Promise<{ contactId: string }>
}

export default function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { contactId } = use(params)
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: contact, isLoading } = useContact(contactId)
  const deleteMutation = useDeleteContact()

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(contactId)
    router.push(ROUTES.CONTACTS)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Contato não encontrado"
          description="O contato que você está procurando não existe."
          backHref={ROUTES.CONTACTS}
        />
      </div>
    )
  }

  const fullName = `${contact.first_name} ${contact.last_name || ''}`.trim()

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName}
        description={contact.job_title || 'Contato'}
        backHref={ROUTES.CONTACTS}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/contacts/${contactId}/edit`)}
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
            <CardTitle>Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-primary hover:underline"
                >
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${contact.phone}`}
                  className="hover:underline"
                >
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.mobile && (
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${contact.mobile}`}
                  className="hover:underline"
                >
                  {contact.mobile}
                </a>
              </div>
            )}
            {!contact.email && !contact.phone && !contact.mobile && (
              <p className="text-muted-foreground">
                Nenhuma informação de contato cadastrada.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Profissionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.company && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Link
                  href={ROUTES.CLIENT_DETAIL(contact.company.id)}
                  className="text-primary hover:underline"
                >
                  {contact.company.name}
                </Link>
              </div>
            )}
            {contact.job_title && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{contact.job_title}</span>
              </div>
            )}
            {contact.department && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{contact.department}</span>
              </div>
            )}
            {contact.source && (
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>Origem: {contact.source}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {contact.tags && contact.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Nenhuma tag cadastrada.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Criado em: {formatDate(contact.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Atualizado em: {formatDate(contact.updated_at)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividades */}
      <ActivitySection contactId={contactId} />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Contato"
        description={`Tem certeza que deseja excluir o contato "${fullName}"?`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
