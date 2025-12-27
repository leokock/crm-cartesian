'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { solutionSchema, type SolutionFormData } from '@/lib/validations'
import { useCreateSolution, useUpdateSolution } from '@/hooks/use-solutions'
import type { Database } from '@/types/database.types'

type Solution = Database['public']['Tables']['solutions']['Row']

interface SolutionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  solution?: Solution | null
}

export function SolutionFormDialog({
  open,
  onOpenChange,
  solution,
}: SolutionFormDialogProps) {
  const isEditing = !!solution
  const createMutation = useCreateSolution()
  const updateMutation = useUpdateSolution()
  const isLoading = createMutation.isPending || updateMutation.isPending

  const form = useForm<SolutionFormData>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      name: '',
      description: '',
      base_price: undefined,
      is_active: true,
    },
  })

  useEffect(() => {
    if (solution) {
      form.reset({
        name: solution.name,
        description: solution.description || '',
        base_price: solution.base_price || undefined,
        is_active: solution.is_active,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        base_price: undefined,
        is_active: true,
      })
    }
  }, [solution, form])

  const onSubmit = async (data: SolutionFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: solution.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onOpenChange(false)
      form.reset()
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Solução' : 'Nova Solução'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações da solução'
              : 'Preencha os dados para criar uma nova solução'}
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
                    <Input placeholder="Nome da solução" {...field} />
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
                      placeholder="Descreva a solução..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="base_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Base (R$)</FormLabel>
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
                  <FormDescription>
                    Valor de referência para orçamentos
                  </FormDescription>
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
                      Soluções inativas não aparecem para seleção em novos deals
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
                  'Criar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
