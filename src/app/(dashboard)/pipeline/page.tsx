import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { KanbanBoard } from '@/components/pipeline'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Pipeline de Vendas',
  description: 'Gerencie seus negócios através do pipeline de vendas',
}

function KanbanLoading() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="w-[300px] min-w-[300px]">
          <Skeleton className="h-12 mb-2" />
          <Skeleton className="h-32" />
        </div>
      ))}
    </div>
  )
}

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline de Vendas"
        description="Arraste os negócios entre os estágios para atualizar o progresso"
      />

      <Suspense fallback={<KanbanLoading />}>
        <KanbanBoard />
      </Suspense>
    </div>
  )
}
