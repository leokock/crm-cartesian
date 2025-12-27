'use client'

import { useEffect } from 'react'
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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateWorkflow, useUpdateWorkflow } from '@/hooks/use-workflows'
import { useToast } from '@/hooks/use-toast'
import { TRIGGER_TYPES, type WorkflowTemplate, type TriggerType } from '@/services/workflows.service'
import { Loader2, Zap } from 'lucide-react'

const workflowSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  trigger_type: z.enum(['deal_stage_changed', 'deal_created', 'activity_completed', 'manual']),
  is_active: z.boolean(),
})

type WorkflowFormData = z.infer<typeof workflowSchema>

interface WorkflowFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflow?: WorkflowTemplate | null
  onSuccess?: (workflow: WorkflowTemplate) => void
}

export function WorkflowFormDialog({
  open,
  onOpenChange,
  workflow,
  onSuccess,
}: WorkflowFormDialogProps) {
  const { toast } = useToast()
  const createWorkflow = useCreateWorkflow()
  const updateWorkflow = useUpdateWorkflow()

  const isEditing = !!workflow

  const form = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: '',
      description: '',
      trigger_type: 'manual',
      is_active: true,
    },
  })

  useEffect(() => {
    if (open) {
      if (workflow) {
        form.reset({
          name: workflow.name,
          description: workflow.description || '',
          trigger_type: workflow.trigger_type,
          is_active: workflow.is_active,
        })
      } else {
        form.reset({
          name: '',
          description: '',
          trigger_type: 'manual',
          is_active: true,
        })
      }
    }
  }, [open, workflow, form])

  async function onSubmit(data: WorkflowFormData) {
    try {
      let result: WorkflowTemplate
      if (isEditing && workflow) {
        result = await updateWorkflow.mutateAsync({ id: workflow.id, data })
        toast({
          title: 'Workflow atualizado',
          description: 'O workflow foi atualizado com sucesso.',
        })
      } else {
        result = await createWorkflow.mutateAsync(data)
        toast({
          title: 'Workflow criado',
          description: 'O workflow foi criado com sucesso.',
        })
      }
      onOpenChange(false)
      onSuccess?.(result)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o workflow.',
        variant: 'destructive',
      })
    }
  }

  const isPending = createWorkflow.isPending || updateWorkflow.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {isEditing ? 'Editar Workflow' : 'Novo Workflow'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edite as configurações do workflow'
              : 'Configure um novo workflow de automação'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Acompanhamento de proposta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o que este workflow faz..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trigger_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gatilho *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gatilho" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRIGGER_TYPES.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          <div>
                            <div className="font-medium">{trigger.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {trigger.description}
                            </div>
                          </div>
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
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativo</FormLabel>
                    <FormDescription>
                      Workflows inativos não serão executados automaticamente
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                {isEditing ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
