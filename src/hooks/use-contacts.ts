'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  getContactsByCompany,
  searchContacts,
  updateContact,
  type ContactFilters,
} from '@/services/contacts.service'
import type { ContactFormData } from '@/lib/validations'
import { toast } from 'sonner'

export function useContacts(filters?: ContactFilters) {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => getContacts(filters),
  })
}

export function useContactsByCompany(companyId: string) {
  return useQuery({
    queryKey: ['contacts', 'company', companyId],
    queryFn: () => getContactsByCompany(companyId),
    enabled: !!companyId,
  })
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => getContact(id),
    enabled: !!id,
  })
}

export function useSearchContacts(query: string) {
  return useQuery({
    queryKey: ['contacts', 'search', query],
    queryFn: () => searchContacts(query),
    enabled: query.length >= 2,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ContactFormData) => createContact(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      if (data.company_id) {
        queryClient.invalidateQueries({ queryKey: ['clients', data.company_id] })
      }
      toast.success('Contato criado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar contato: ${error.message}`)
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactFormData }) =>
      updateContact(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['contacts', id] })
      toast.success('Contato atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar contato: ${error.message}`)
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contato excluído com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir contato: ${error.message}`)
    },
  })
}
