import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { ContactForm } from '@/components/contacts/contact-form'
import { ROUTES } from '@/lib/constants/routes'

export default function NewContactPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Contato"
        description="Cadastre um novo contato"
        backHref={ROUTES.CONTACTS}
      />
      <Suspense>
        <ContactForm />
      </Suspense>
    </div>
  )
}
