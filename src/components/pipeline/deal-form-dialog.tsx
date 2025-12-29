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
import { useClients } from '@/hooks/use-clients'
import { useProjects } from '@/hooks/use-projects'
import { useContacts } from '@/hooks/use-contacts'
import { usePipelineStages } from '@/hooks/use-pipeline'
import { useCreateDeal, useUpdateDeal } from '@/hooks/use-deals'
import { useToast } from '@/hooks/use-toast'
import type { DealWithRelations } from '@/services/deals.service'
import { Loader2 } from 'lucide-react'

const dealSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  company_id: z.string().min(1, 'Empresa é obrigatória'),
  project_id: z.string().optional().nullable(),
  contact_id: z.string().optional().nullable(),
  stage_id: z.string().min(1, 'Estágio é obrigatório'),
  description: z.string().optional().nullable(),
  value: z.number().min(0, 'Valor não pode ser negativo').optional().nullable(),
  expected_close_date: z.string().optional().nullable(),
})

type DealFormData = z.infer<typeof dealSchema>

interface DealFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stageId?: string | null
  deal?: DealWithRelations | null
}

export function DealFormDialog({
  open,
  onOpenChange,
  stageId,
  deal,
}: DealFormDialogProps) {
  const { toast } = useToast()
  const { data: clients } = useClients()
  const { data: projects } = useProjects()
  const { data: contacts } = useContacts()
  const { data: stages } = usePipelineStages()
  const createDeal = useCreateDeal()
  const updateDeal = useUpdateDeal()

  const isEditing = !!deal

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: '',
      company_id: '',
      project_id: null,
      contact_id: null,
      stage_id: stageId || '',
      description: null,
      value: null,
      expected_close_date: null,
    },
  })

  const selectedCompanyId = form.watch('company_id')

  // Filter projects and contacts by selected company
  const filteredProjects = (projects as { id: string; name: string; company_id: string }[] | undefined)?.filter(
    (p) => p.company_id === selectedCompanyId
  )
  const filteredContacts = (contacts as { id: string; first_name: string; last_name: string | null; company_id: string | null }[] | undefined)?.filter(
    (c) => c.company_id === selectedCompanyId
  )

  useEffect(() => {
    if (open) {
      if (deal) {
        form.reset({
          title: deal.title,
          company_id: deal.company_id,
          project_id: deal.project_id,
          contact_id: deal.contact_id,
          stage_id: deal.stage_id,
          description: deal.description,
          value: deal.value,
          expected_close_date: deal.expected_close_date,
        })
      } else {
        form.reset({
          title: '',
          company_id: '',
          project_id: null,
          contact_id: null,
          stage_id: stageId || '',
          description: null,
          value: null,
          expected_close_date: null,
        })
      }
    }
  }, [open, deal, stageId, form])

  async function onSubmit(data: DealFormData) {
    try {
      if (isEditing && deal) {
        await updateDeal.mutateAsync({ id: deal.id, data })
        toast({
          title: 'Negócio atualizado',
          description: 'O negócio foi atualizado com sucesso.',
        })
      } else {
        await createDeal.mutateAsync(data)
        toast({
          title: 'Negócio criado',
          description: 'O negócio foi criado com sucesso.',
        })
      }
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o negócio.',
        variant: 'destructive',
      })
    }
  }

  const isPending = createDeal.isPending || updateDeal.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Negócio' : 'Novo Negócio'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Proposta para projeto X" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
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
                name="stage_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estágio *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stages?.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: stage.color }}
                              />
                              {stage.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projeto</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === '__none__' ? null : value)}
                      value={field.value || '__none__'}
                      disabled={!selectedCompanyId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhum</SelectItem>
                        {filteredProjects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
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
                name="contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === '__none__' ? null : value)}
                      value={field.value || '__none__'}
                      disabled={!selectedCompanyId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhum</SelectItem>
                        {filteredContacts?.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? null : parseFloat(value))
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_close_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previsão de Fechamento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(e.target.value || null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes do negócio..."
                      className="resize-none"
                      rows={3}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value || null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
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
