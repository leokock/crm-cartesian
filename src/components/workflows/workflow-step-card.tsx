'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useDeleteWorkflowStep } from '@/hooks/use-workflows'
import { useToast } from '@/hooks/use-toast'
import { ACTION_TYPES, type WorkflowStep } from '@/services/workflows.service'
import {
  MoreVertical,
  Trash2,
  GripVertical,
  CheckSquare,
  Bell,
  RefreshCw,
  Clock,
  Pencil,
} from 'lucide-react'

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  create_activity: CheckSquare,
  send_notification: Bell,
  update_deal: RefreshCw,
  wait: Clock,
}

interface WorkflowStepCardProps {
  step: WorkflowStep
  workflowId: string
  index: number
  onEdit?: (step: WorkflowStep) => void
}

export function WorkflowStepCard({ step, workflowId, index, onEdit }: WorkflowStepCardProps) {
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteStep = useDeleteWorkflowStep()

  const actionType = ACTION_TYPES.find((a) => a.value === step.action_type)
  const ActionIcon = actionIcons[step.action_type] || CheckSquare

  const handleDelete = async () => {
    try {
      await deleteStep.mutateAsync({ stepId: step.id, workflowId })
      toast({
        title: 'Etapa removida',
        description: 'A etapa foi removida do workflow.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao remover a etapa.',
        variant: 'destructive',
      })
    }
    setShowDeleteDialog(false)
  }

  const getConfigDescription = () => {
    const config = step.action_config as Record<string, unknown>

    switch (step.action_type) {
      case 'create_activity':
        return config.activity_type
          ? `Criar ${config.activity_type as string}`
          : 'Criar atividade'
      case 'send_notification':
        return config.message
          ? `"${(config.message as string).substring(0, 30)}..."`
          : 'Enviar notificação'
      case 'update_deal':
        return config.field
          ? `Atualizar ${config.field as string}`
          : 'Atualizar negócio'
      case 'wait':
        return config.duration
          ? `Aguardar ${config.duration as string}`
          : 'Aguardar'
      default:
        return actionType?.label
    }
  }

  return (
    <>
      <Card className="relative">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="cursor-grab text-muted-foreground hover:text-foreground">
              <GripVertical className="h-5 w-5" />
            </div>

            <Badge variant="outline" className="rounded-full h-6 w-6 p-0 flex items-center justify-center">
              {index + 1}
            </Badge>

            <div className="p-2 rounded-lg bg-primary/10">
              <ActionIcon className="h-4 w-4 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{actionType?.label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {getConfigDescription()}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(step)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover etapa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A etapa será removida permanentemente do workflow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
