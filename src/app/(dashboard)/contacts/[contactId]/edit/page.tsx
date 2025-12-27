'use client'

import { use } from 'react'
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { ContactForm } from '@/components/contacts/contact-form'
import { Skeleton } from '@/components/ui/skeleton'
import { useContact } from '@/hooks/use-contacts'
import { ROUTES } from '@/lib/constants/routes'

interface EditContactPageProps {
  params: Promise<{ contactId: string }>
}

function EditContactContent({ contactId }: { contactId: string }) {
  const { data: contact, isLoading } = useContact(contactId)

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (!contact) {
    return (
      <PageHeader
        title="Contato não encontrado"
        description="O contato que você está procurando não existe."
        backHref={ROUTES.CONTACTS}
      />
    )
  }

  return <ContactForm contact={contact} />
}

export default function EditContactPage({ params }: EditContactPageProps) {
  const { contactId } = use(params)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Contato"
        description="Atualize as informações do contato"
        backHref={ROUTES.CONTACT_DETAIL(contactId)}
      />
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <EditContactContent contactId={contactId} />
      </Suspense>
    </div>
  )
}
