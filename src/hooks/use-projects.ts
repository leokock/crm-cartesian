'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  getProjectsByCompany,
  updateProject,
  updateProjectStatus,
  type ProjectFilters,
} from '@/services/projects.service'
import type { ProjectFormData } from '@/lib/validations'
import { toast } from 'sonner'

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => getProjects(filters),
  })
}

export function useProjectsByCompany(companyId: string) {
  return useQuery({
    queryKey: ['projects', 'company', companyId],
    queryFn: () => getProjectsByCompany(companyId),
    enabled: !!companyId,
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProjectFormData) => createProject(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['clients', data.company_id] })
      toast.success('Projeto criado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar projeto: ${error.message}`)
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectFormData }) =>
      updateProject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
      toast.success('Projeto atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar projeto: ${error.message}`)
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Projeto excluído com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir projeto: ${error.message}`)
    },
  })
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: 'active' | 'completed' | 'cancelled'
    }) => updateProjectStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
      toast.success('Status atualizado!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`)
    },
  })
}
