'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useOrganization, useUpdateOrganization } from '@/hooks/use-settings'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { Loader2, Building2, Globe, Phone, MapPin, Calendar } from 'lucide-react'

const organizationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

export default function OrganizationSettingsPage() {
  const { toast } = useToast()
  const { data: organization, isLoading } = useOrganization()
  const updateOrganization = useUpdateOrganization()

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      website: '',
      phone: '',
      address: '',
    },
  })

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name || '',
        website: organization.website || '',
        phone: organization.phone || '',
        address: organization.address || '',
      })
    }
  }, [organization, form])

  async function onSubmit(data: OrganizationFormData) {
    try {
      await updateOrganization.mutateAsync({
        name: data.name,
        website: data.website || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
      })
      toast({
        title: 'Organização atualizada',
        description: 'Os dados foram salvos com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar a organização.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Organization Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={organization?.logo_url || undefined} />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {organization?.name?.charAt(0) || 'O'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{organization?.name || 'Organização'}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3" />
                Criada em {organization?.created_at ? formatDate(organization.created_at) : '-'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Organization Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dados da Organização
          </CardTitle>
          <CardDescription>
            Atualize as informações da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da sua empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="https://suaempresa.com.br"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="(00) 0000-0000"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          placeholder="Endereço completo"
                          className="pl-10 resize-none"
                          rows={2}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={updateOrganization.isPending}>
                  {updateOrganization.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar alterações
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
