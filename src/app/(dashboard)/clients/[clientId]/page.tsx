'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  ExternalLink,
  FolderKanban,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ActivitySection } from '@/components/activities'
import { useClient, useDeleteClient } from '@/hooks/use-clients'
import { formatDate, formatPhone, formatCNPJ } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'
import { useState } from 'react'

interface ClientDetailPageProps {
  params: Promise<{ clientId: string }>
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clientId } = use(params)
  const router = useRouter()
  const { data: client, isLoading } = useClient(clientId)
  const deleteMutation = useDeleteClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(clientId)
    router.push(ROUTES.CLIENTS)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Cliente não encontrado</h2>
        <Button className="mt-4" asChild>
          <Link href={ROUTES.CLIENTS}>Voltar para Clientes</Link>
        </Button>
      </div>
    )
  }

  const projects = client.projects || []
  const contacts = client.contacts || []

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={client.industry || 'Cliente'}
        backHref={ROUTES.CLIENTS}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreHorizontal className="mr-2 h-4 w-4" />
              Ações
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/clients/${clientId}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.cnpj && (
              <div>
                <p className="text-sm text-muted-foreground">CNPJ</p>
                <p className="font-medium">{formatCNPJ(client.cnpj)}</p>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formatPhone(client.phone)}</span>
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {client.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {client.size && (
              <div>
                <p className="text-sm text-muted-foreground">Porte</p>
                <p className="font-medium capitalize">{client.size}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Cadastrado em</p>
              <p className="font-medium">{formatDate(client.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Projetos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="h-4 w-4" />
              Projetos ({projects.length})
            </CardTitle>
            <Button size="sm" variant="ghost" asChild>
              <Link href={`${ROUTES.PROJECT_NEW}?company_id=${clientId}`}>
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum projeto cadastrado
              </p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={ROUTES.PROJECT_DETAIL(project.id)}
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{project.name}</span>
                      <Badge
                        variant={
                          project.status === 'active'
                            ? 'default'
                            : project.status === 'completed'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {project.status === 'active'
                          ? 'Ativo'
                          : project.status === 'completed'
                          ? 'Concluído'
                          : 'Cancelado'}
                      </Badge>
                    </div>
                    {project.project_type && (
                      <p className="text-sm text-muted-foreground">
                        {project.project_type}
                      </p>
                    )}
                  </Link>
                ))}
                {projects.length > 5 && (
                  <Button variant="link" className="p-0" asChild>
                    <Link href={`${ROUTES.PROJECTS}?company_id=${clientId}`}>
                      Ver todos os {projects.length} projetos
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contatos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Contatos ({contacts.length})
            </CardTitle>
            <Button size="sm" variant="ghost" asChild>
              <Link href={`${ROUTES.CONTACT_NEW}?company_id=${clientId}`}>
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum contato cadastrado
              </p>
            ) : (
              <div className="space-y-3">
                {contacts.slice(0, 5).map((contact) => (
                  <Link
                    key={contact.id}
                    href={ROUTES.CONTACT_DETAIL(contact.id)}
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <p className="font-medium">
                      {contact.first_name} {contact.last_name}
                    </p>
                    {contact.job_title && (
                      <p className="text-sm text-muted-foreground">
                        {contact.job_title}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      {contact.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                {contacts.length > 5 && (
                  <Button variant="link" className="p-0" asChild>
                    <Link href={`${ROUTES.CONTACTS}?company_id=${clientId}`}>
                      Ver todos os {contacts.length} contatos
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      {client.tags && client.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {client.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Atividades */}
      <ActivitySection companyId={clientId} />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente "${client.name}"? Os projetos e negócios associados também serão afetados.`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
