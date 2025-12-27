'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAddWorkflowStep, useUpdateWorkflowStep } from '@/hooks/use-workflows'
import { useToast } from '@/hooks/use-toast'
import { ACTION_TYPES, type WorkflowStep, type ActionType } from '@/services/workflows.service'
import { Loader2, Plus, CheckSquare, Bell, RefreshCw, Clock } from 'lucide-react'

// Import ACTIVITY_TYPES from activities service
import { ACTIVITY_TYPES as ACTIVITY_TYPE_OPTIONS } from '@/services/activities.service'

const stepSchema = z.object({
  action_type: z.enum(['create_activity', 'send_notification', 'update_deal', 'wait']),
  // Activity config
  activity_type: z.string().optional(),
  activity_title: z.string().optional(),
  // Notification config
  notification_message: z.string().optional(),
  // Wait config
  wait_duration: z.string().optional(),
  wait_unit: z.enum(['minutes', 'hours', 'days']).optional(),
})

type StepFormData = z.infer<typeof stepSchema>

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  create_activity: CheckSquare,
  send_notification: Bell,
  update_deal: RefreshCw,
  wait: Clock,
}

interface AddStepDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflowId: string
  editingStep?: WorkflowStep | null
}

export function AddStepDialog({ open, onOpenChange, workflowId, editingStep }: AddStepDialogProps) {
  const { toast } = useToast()
  const addStep = useAddWorkflowStep()
  const updateStep = useUpdateWorkflowStep()

  const isEditing = !!editingStep

  const form = useForm<StepFormData>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      action_type: 'create_activity',
      activity_type: 'task',
      activity_title: '',
      notification_message: '',
      wait_duration: '1',
      wait_unit: 'days',
    },
  })

  const actionType = form.watch('action_type')

  async function onSubmit(data: StepFormData) {
    try {
      const actionConfig: Record<string, unknown> = {}

      switch (data.action_type) {
        case 'create_activity':
          actionConfig.activity_type = data.activity_type
          actionConfig.activity_title = data.activity_title
          break
        case 'send_notification':
          actionConfig.message = data.notification_message
          break
        case 'wait':
          actionConfig.duration = `${data.wait_duration} ${data.wait_unit}`
          actionConfig.wait_duration = Number(data.wait_duration)
          actionConfig.wait_unit = data.wait_unit
          break
      }

      if (isEditing && editingStep) {
        await updateStep.mutateAsync({
          stepId: editingStep.id,
          workflowId,
          data: {
            action_type: data.action_type,
            action_config: actionConfig,
          },
        })
        toast({
          title: 'Etapa atualizada',
          description: 'A etapa foi atualizada com sucesso.',
        })
      } else {
        await addStep.mutateAsync({
          workflowId,
          data: {
            action_type: data.action_type,
            action_config: actionConfig,
          },
        })
        toast({
          title: 'Etapa adicionada',
          description: 'A etapa foi adicionada ao workflow.',
        })
      }

      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar a etapa.',
        variant: 'destructive',
      })
    }
  }

  const isPending = addStep.isPending || updateStep.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {isEditing ? 'Editar Etapa' : 'Adicionar Etapa'}
          </DialogTitle>
          <DialogDescription>
            Configure a ação que será executada nesta etapa
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="action_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Ação *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a ação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACTION_TYPES.map((action) => {
                        const Icon = actionIcons[action.value]
                        return (
                          <SelectItem key={action.value} value={action.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{action.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {action.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Activity Config */}
            {actionType === 'create_activity' && (
              <>
                <FormField
                  control={form.control}
                  name="activity_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Atividade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ACTIVITY_TYPE_OPTIONS.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activity_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Atividade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Follow-up com cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Notification Config */}
            {actionType === 'send_notification' && (
              <FormField
                control={form.control}
                name="notification_message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem da Notificação</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite a mensagem..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Wait Config */}
            {actionType === 'wait' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wait_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wait_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="minutes">Minutos</SelectItem>
                          <SelectItem value="hours">Horas</SelectItem>
                          <SelectItem value="days">Dias</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Update Deal - simplified */}
            {actionType === 'update_deal' && (
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-sm text-muted-foreground">
                  Configuração avançada de atualização de negócio
                  será implementada em breve.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
