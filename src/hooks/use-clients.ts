'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCompany,
  deleteClient,
  getClient,
  getClients,
  getIndustries,
  updateClient,
  type ClientFilters,
} from '@/services/clients.service'
import type { CompanyFormData } from '@/lib/validations'
import { toast } from 'sonner'

export function useClients(filters?: ClientFilters) {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => getClients(filters),
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => getClient(id),
    enabled: !!id,
  })
}

export function useIndustries() {
  return useQuery({
    queryKey: ['industries'],
    queryFn: getIndustries,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CompanyFormData) => createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente criado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar cliente: ${error.message}`)
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompanyFormData }) =>
      updateClient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['clients', id] })
      toast.success('Cliente atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar cliente: ${error.message}`)
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente excluído com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir cliente: ${error.message}`)
    },
  })
}
