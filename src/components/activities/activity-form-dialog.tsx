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
import { useDeals } from '@/hooks/use-deals'
import { useCreateActivity, useUpdateActivity } from '@/hooks/use-activities'
import { useToast } from '@/hooks/use-toast'
import { ACTIVITY_TYPES, type ActivityWithRelations } from '@/services/activities.service'
import { Loader2, Phone, Users, Mail, CheckSquare, FileText, MapPin } from 'lucide-react'

const activitySchema = z.object({
  type: z.enum(['call', 'meeting', 'email', 'task', 'note', 'visit']),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  company_id: z.string().optional().nullable(),
  contact_id: z.string().optional().nullable(),
  deal_id: z.string().optional().nullable(),
  project_id: z.string().optional().nullable(),
})

type ActivityFormData = z.infer<typeof activitySchema>

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone,
  Users,
  Mail,
  CheckSquare,
  FileText,
  MapPin,
}

interface ActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: ActivityWithRelations | null
  defaultValues?: {
    company_id?: string
    contact_id?: string
    deal_id?: string
    project_id?: string
  }
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  activity,
  defaultValues,
}: ActivityFormDialogProps) {
  const { toast } = useToast()
  const { data: clients } = useClients()
  const { data: projects } = useProjects()
  const { data: contacts } = useContacts()
  const { data: deals } = useDeals()
  const createActivity = useCreateActivity()
  const updateActivity = useUpdateActivity()

  const isEditing = !!activity

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: 'task',
      title: '',
      description: null,
      due_date: null,
      company_id: defaultValues?.company_id || null,
      contact_id: defaultValues?.contact_id || null,
      deal_id: defaultValues?.deal_id || null,
      project_id: defaultValues?.project_id || null,
    },
  })

  const selectedCompanyId = form.watch('company_id')

  const filteredProjects = (projects as { id: string; name: string; company_id: string }[] | undefined)?.filter(
    (p) => !selectedCompanyId || p.company_id === selectedCompanyId
  )
  const filteredContacts = (contacts as { id: string; first_name: string; last_name: string | null; company_id: string | null }[] | undefined)?.filter(
    (c) => !selectedCompanyId || c.company_id === selectedCompanyId
  )
  const filteredDeals = (deals as { id: string; title: string; company_id: string }[] | undefined)?.filter(
    (d) => !selectedCompanyId || d.company_id === selectedCompanyId
  )

  useEffect(() => {
    if (open) {
      if (activity) {
        form.reset({
          type: activity.type,
          title: activity.title,
          description: activity.description,
          due_date: activity.due_date,
          company_id: activity.company_id,
          contact_id: activity.contact_id,
          deal_id: activity.deal_id,
          project_id: activity.project_id,
        })
      } else {
        form.reset({
          type: 'task',
          title: '',
          description: null,
          due_date: null,
          company_id: defaultValues?.company_id || null,
          contact_id: defaultValues?.contact_id || null,
          deal_id: defaultValues?.deal_id || null,
          project_id: defaultValues?.project_id || null,
        })
      }
    }
  }, [open, activity, defaultValues, form])

  async function onSubmit(data: ActivityFormData) {
    try {
      if (isEditing && activity) {
        await updateActivity.mutateAsync({ id: activity.id, data })
        toast({
          title: 'Atividade atualizada',
          description: 'A atividade foi atualizada com sucesso.',
        })
      } else {
        await createActivity.mutateAsync(data)
        toast({
          title: 'Atividade criada',
          description: 'A atividade foi criada com sucesso.',
        })
      }
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar a atividade.',
        variant: 'destructive',
      })
    }
  }

  const isPending = createActivity.isPending || updateActivity.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((type) => {
                        const Icon = iconMap[type.icon]
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {Icon && <Icon className="h-4 w-4" />}
                              {type.label}
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

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Ligar para cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
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
                    <FormLabel>Empresa</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === '__none__' ? null : value)}
                      value={field.value || '__none__'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhuma</SelectItem>
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
                name="contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === '__none__' ? null : value)}
                      value={field.value || '__none__'}
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
                name="deal_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Negócio</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === '__none__' ? null : value)}
                      value={field.value || '__none__'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhum</SelectItem>
                        {filteredDeals?.map((deal) => (
                          <SelectItem key={deal.id} value={deal.id}>
                            {deal.title}
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
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projeto</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === '__none__' ? null : value)}
                      value={field.value || '__none__'}
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
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes da atividade..."
                      className="resize-none"
                      rows={3}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
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
