import { PageHeader } from '@/components/shared/page-header'
import { ClientForm } from '@/components/clients/client-form'
import { ROUTES } from '@/lib/constants/routes'

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Cliente"
        description="Cadastre um novo cliente para gerenciar projetos e oportunidades"
        backHref={ROUTES.CLIENTS}
      />
      <ClientForm />
    </div>
  )
}
