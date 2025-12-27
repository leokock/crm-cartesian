'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/page-header'
import { WorkflowFormDialog, WorkflowStepCard, AddStepDialog } from '@/components/workflows'
import { useWorkflow, useToggleWorkflowActive, useExecuteWorkflow, useWorkflowExecutions } from '@/hooks/use-workflows'
import { useToast } from '@/hooks/use-toast'
import { TRIGGER_TYPES, type WorkflowStep } from '@/services/workflows.service'
import {
  Zap,
  Plus,
  Play,
  Settings,
  ArrowDown,
  History,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'

interface WorkflowDetailPageProps {
  params: Promise<{ workflowId: string }>
}

const statusIcons = {
  running: Loader2,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
}

const statusColors = {
  running: 'text-blue-500',
  completed: 'text-green-500',
  failed: 'text-red-500',
  cancelled: 'text-gray-500',
}

const statusLabels = {
  running: 'Em execução',
  completed: 'Concluído',
  failed: 'Falhou',
  cancelled: 'Cancelado',
}

export default function WorkflowDetailPage({ params }: WorkflowDetailPageProps) {
  const { workflowId } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const { data: workflow, isLoading } = useWorkflow(workflowId)
  const { data: executions } = useWorkflowExecutions(workflowId)
  const toggleActive = useToggleWorkflowActive()
  const executeWorkflow = useExecuteWorkflow()

  const [showFormDialog, setShowFormDialog] = useState(false)
  const [showAddStepDialog, setShowAddStepDialog] = useState(false)
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null)

  const handleToggleActive = async () => {
    if (!workflow) return

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

  const handleExecute = async () => {
    if (!workflow) return

    try {
      await executeWorkflow.mutateAsync({ workflowId: workflow.id })
      toast({
        title: 'Workflow iniciado',
        description: 'A execução do workflow foi iniciada.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao executar o workflow.',
        variant: 'destructive',
      })
    }
  }

  const getTriggerLabel = (triggerType: string) => {
    return TRIGGER_TYPES.find((t) => t.value === triggerType)?.label || triggerType
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Zap className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Workflow não encontrado</h2>
        <Button className="mt-4" asChild>
          <Link href={ROUTES.WORKFLOWS}>Voltar para Workflows</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={workflow.name}
        description={workflow.description || 'Workflow de automação'}
        backHref={ROUTES.WORKFLOWS}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-muted-foreground">
              {workflow.is_active ? 'Ativo' : 'Inativo'}
            </span>
            <Switch
              checked={workflow.is_active}
              onCheckedChange={handleToggleActive}
            />
          </div>
          <Button variant="outline" onClick={() => setShowFormDialog(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
          {workflow.trigger_type === 'manual' && (
            <Button onClick={handleExecute} disabled={executeWorkflow.isPending}>
              {executeWorkflow.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Executar
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Steps Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Etapas do Workflow</CardTitle>
                  <CardDescription>
                    Configure as ações que serão executadas em sequência
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddStepDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Etapa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Trigger */}
              <div className="mb-6">
                <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5">
                  <div className="p-2 rounded-full bg-primary text-primary-foreground">
                    <Play className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Gatilho</p>
                    <p className="text-sm text-muted-foreground">
                      {getTriggerLabel(workflow.trigger_type)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              {workflow.steps && workflow.steps.length > 0 ? (
                <div className="space-y-3">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id}>
                      <div className="flex justify-center py-2">
                        <ArrowDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <WorkflowStepCard
                        step={step}
                        workflowId={workflowId}
                        index={index}
                        onEdit={(step) => {
                          setEditingStep(step)
                          setShowAddStepDialog(true)
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma etapa configurada</p>
                  <p className="text-sm">Adicione etapas para definir as ações do workflow</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Execution History */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Execuções
              </CardTitle>
            </CardHeader>
            <CardContent>
              {executions && executions.length > 0 ? (
                <div className="space-y-3">
                  {executions.slice(0, 10).map((execution) => {
                    const StatusIcon = statusIcons[execution.status]
                    return (
                      <div
                        key={execution.id}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                      >
                        <StatusIcon
                          className={`h-4 w-4 ${statusColors[execution.status]} ${
                            execution.status === 'running' ? 'animate-spin' : ''
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {statusLabels[execution.status]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(execution.started_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma execução ainda</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Gatilho</p>
                <Badge variant="outline" className="mt-1">
                  {getTriggerLabel(workflow.trigger_type)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Etapas</p>
                <p className="font-medium">{workflow.steps?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                  {workflow.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <WorkflowFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        workflow={workflow}
      />

      <AddStepDialog
        open={showAddStepDialog}
        onOpenChange={(open) => {
          setShowAddStepDialog(open)
          if (!open) setEditingStep(null)
        }}
        workflowId={workflowId}
        editingStep={editingStep}
      />
    </div>
  )
}
