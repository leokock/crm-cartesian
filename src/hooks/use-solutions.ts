'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSolution,
  deleteSolution,
  getSolution,
  getSolutions,
  toggleSolutionActive,
  updateSolution,
} from '@/services/solutions.service'
import type { SolutionFormData } from '@/lib/validations'
import { toast } from 'sonner'

export function useSolutions() {
  return useQuery({
    queryKey: ['solutions'],
    queryFn: getSolutions,
  })
}

export function useSolution(id: string) {
  return useQuery({
    queryKey: ['solutions', id],
    queryFn: () => getSolution(id),
    enabled: !!id,
  })
}

export function useCreateSolution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SolutionFormData) => createSolution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] })
      toast.success('Solução criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar solução: ${error.message}`)
    },
  })
}

export function useUpdateSolution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SolutionFormData }) =>
      updateSolution(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] })
      queryClient.invalidateQueries({ queryKey: ['solutions', id] })
      toast.success('Solução atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar solução: ${error.message}`)
    },
  })
}

export function useDeleteSolution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSolution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] })
      toast.success('Solução excluída com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir solução: ${error.message}`)
    },
  })
}

export function useToggleSolutionActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleSolutionActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] })
      toast.success('Status atualizado!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`)
    },
  })
}
