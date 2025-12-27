'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { WorkflowFormDialog } from '@/components/workflows'
import { useWorkflows, useToggleWorkflowActive, useDeleteWorkflow } from '@/hooks/use-workflows'
import { useToast } from '@/hooks/use-toast'
import { TRIGGER_TYPES, type WorkflowTemplate } from '@/services/workflows.service'
import {
  Workflow,
  MoreVertical,
  Pencil,
  Trash2,
  Play,
  Zap,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

function WorkflowCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function WorkflowsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: workflows, isLoading } = useWorkflows()
  const toggleActive = useToggleWorkflowActive()
  const deleteWorkflow = useDeleteWorkflow()

  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowTemplate | null>(null)
  const [deletingWorkflow, setDeletingWorkflow] = useState<WorkflowTemplate | null>(null)

  const handleToggleActive = async (workflow: WorkflowTemplate) => {
    try {
      await toggleActive.mutateAsync({ id: workflow.id, isActive: !workflow.is_active })
      toast({
        title: workflow.is_active ? 'Workflow desativado' : 'Workflow ativado',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao alterar o status.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingWorkflow) return

    try {
      await deleteWorkflow.mutateAsync(deletingWorkflow.id)
      toast({
        title: 'Workflow excluído',
        description: 'O workflow foi excluído com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir o workflow.',
        variant: 'destructive',
      })
    }
    setDeletingWorkflow(null)
  }

  const getTriggerLabel = (triggerType: string) => {
    return TRIGGER_TYPES.find((t) => t.value === triggerType)?.label || triggerType
  }

  if (!isLoading && (!workflows || workflows.length === 0)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Workflows"
          description="Automatize tarefas e processos do seu CRM"
        />
        <EmptyState
          icon={Workflow}
          title="Nenhum workflow criado"
          description="Crie seu primeiro workflow para automatizar tarefas como follow-ups, notificações e atualizações."
          action={{
            label: 'Novo Workflow',
            onClick: () => setShowFormDialog(true),
          }}
        />
        <WorkflowFormDialog
          open={showFormDialog}
          onOpenChange={setShowFormDialog}
          onSuccess={(workflow) => router.push(`/workflows/${workflow.id}`)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflows"
        description="Automatize tarefas e processos do seu CRM"
      >
        <Button onClick={() => setShowFormDialog(true)}>
          <Zap className="mr-2 h-4 w-4" />
          Novo Workflow
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <WorkflowCardSkeleton />
          <WorkflowCardSkeleton />
          <WorkflowCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workflows?.map((workflow) => (
            <Card key={workflow.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className={`h-4 w-4 ${workflow.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                      {workflow.name}
                    </CardTitle>
                    {workflow.description && (
                      <CardDescription className="line-clamp-2">
                        {workflow.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={workflow.is_active}
                      onCheckedChange={() => handleToggleActive(workflow)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/workflows/${workflow.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar etapas
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingWorkflow(workflow)
                            setShowFormDialog(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar configurações
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingWorkflow(workflow)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Badge variant="outline" className="gap-1">
                    <Play className="h-3 w-3" />
                    {getTriggerLabel(workflow.trigger_type)}
                  </Badge>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(workflow.created_at)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full justify-center"
                  asChild
                >
                  <Link href={`/workflows/${workflow.id}`}>
                    Configurar etapas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WorkflowFormDialog
        open={showFormDialog}
        onOpenChange={(open) => {
          setShowFormDialog(open)
          if (!open) setEditingWorkflow(null)
        }}
        workflow={editingWorkflow}
        onSuccess={(workflow) => {
          if (!editingWorkflow) {
            router.push(`/workflows/${workflow.id}`)
          }
        }}
      />

      <AlertDialog open={!!deletingWorkflow} onOpenChange={(open) => !open && setDeletingWorkflow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O workflow &quot;{deletingWorkflow?.name}&quot; e todas as suas etapas serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
