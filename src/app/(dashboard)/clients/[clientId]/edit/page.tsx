'use client'

import { use } from 'react'
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { ClientForm } from '@/components/clients/client-form'
import { Skeleton } from '@/components/ui/skeleton'
import { useClient } from '@/hooks/use-clients'
import { ROUTES } from '@/lib/constants/routes'

interface EditClientPageProps {
  params: Promise<{ clientId: string }>
}

function EditClientContent({ clientId }: { clientId: string }) {
  const { data: client, isLoading } = useClient(clientId)

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (!client) {
    return (
      <PageHeader
        title="Cliente não encontrado"
        description="O cliente que você está procurando não existe."
        backHref={ROUTES.CLIENTS}
      />
    )
  }

  return <ClientForm client={client} />
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const { clientId } = use(params)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Cliente"
        description="Atualize as informações do cliente"
        backHref={ROUTES.CLIENT_DETAIL(clientId)}
      />
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <EditClientContent clientId={clientId} />
      </Suspense>
    </div>
  )
}
