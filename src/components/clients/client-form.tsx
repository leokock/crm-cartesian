'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { companySchema, type CompanyFormData } from '@/lib/validations'
import { useCreateClient, useUpdateClient } from '@/hooks/use-clients'
import { ROUTES } from '@/lib/constants/routes'
import type { Database } from '@/types/database.types'

type Company = Database['public']['Tables']['companies']['Row']

const industries = [
  'Construção Civil',
  'Incorporadora',
  'Arquitetura',
  'Engenharia',
  'Infraestrutura',
  'Industrial',
  'Comercial',
  'Residencial',
  'Governo',
  'Outros',
]

const sizes = [
  { value: 'micro', label: 'Micro (até 9 funcionários)' },
  { value: 'small', label: 'Pequena (10-49 funcionários)' },
  { value: 'medium', label: 'Média (50-249 funcionários)' },
  { value: 'large', label: 'Grande (250+ funcionários)' },
]

interface ClientFormProps {
  client?: Company | null
}

export function ClientForm({ client }: ClientFormProps) {
  const isEditing = !!client
  const router = useRouter()
  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()
  const isLoading = createMutation.isPending || updateMutation.isPending

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: client?.name || '',
      cnpj: client?.cnpj || '',
      domain: client?.domain || '',
      industry: client?.industry || '',
      size: client?.size || '',
      website: client?.website || '',
      phone: client?.phone || '',
      tags: client?.tags || [],
    },
  })

  const onSubmit = async (data: CompanyFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: client.id, data })
        router.push(ROUTES.CLIENT_DETAIL(client.id))
      } else {
        const newClient = await createMutation.mutateAsync(data)
        router.push(ROUTES.CLIENT_DETAIL(newClient.id))
      }
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa *</FormLabel>
                    <FormControl>
                      <Input placeholder="Construtora ABC Ltda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
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
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porte</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o porte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domínio de Email</FormLabel>
                    <FormControl>
                      <Input placeholder="exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
              'Salvar'
            ) : (
              'Criar Cliente'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
