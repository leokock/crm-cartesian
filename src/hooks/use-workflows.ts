'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  toggleWorkflowActive,
  deleteWorkflow,
  addWorkflowStep,
  updateWorkflowStep,
  deleteWorkflowStep,
  reorderWorkflowSteps,
  getWorkflowExecutions,
  executeWorkflow,
  type WorkflowFormData,
  type WorkflowStepFormData,
} from '@/services/workflows.service'

export const workflowKeys = {
  all: ['workflows'] as const,
  lists: () => [...workflowKeys.all, 'list'] as const,
  list: () => [...workflowKeys.lists()] as const,
  details: () => [...workflowKeys.all, 'detail'] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,
  executions: () => [...workflowKeys.all, 'executions'] as const,
  executionsList: (workflowId?: string) => [...workflowKeys.executions(), workflowId] as const,
}

export function useWorkflows() {
  return useQuery({
    queryKey: workflowKeys.list(),
    queryFn: getWorkflows,
  })
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: () => getWorkflow(id),
    enabled: !!id,
  })
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: WorkflowFormData) => createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
    },
  })
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkflowFormData> }) =>
      updateWorkflow(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.id) })
    },
  })
}

export function useToggleWorkflowActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleWorkflowActive(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.id) })
    },
  })
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
    },
  })
}

// Workflow Steps
export function useAddWorkflowStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: WorkflowStepFormData }) =>
      addWorkflowStep(workflowId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.workflowId) })
    },
  })
}

export function useUpdateWorkflowStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ stepId, workflowId, data }: { stepId: string; workflowId: string; data: Partial<WorkflowStepFormData> }) =>
      updateWorkflowStep(stepId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.workflowId) })
    },
  })
}

export function useDeleteWorkflowStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ stepId, workflowId }: { stepId: string; workflowId: string }) =>
      deleteWorkflowStep(stepId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.workflowId) })
    },
  })
}

export function useReorderWorkflowSteps() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workflowId, stepIds }: { workflowId: string; stepIds: string[] }) =>
      reorderWorkflowSteps(workflowId, stepIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.workflowId) })
    },
  })
}

// Workflow Executions
export function useWorkflowExecutions(workflowId?: string) {
  return useQuery({
    queryKey: workflowKeys.executionsList(workflowId),
    queryFn: () => getWorkflowExecutions(workflowId),
  })
}

export function useExecuteWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workflowId, triggerData }: { workflowId: string; triggerData?: Record<string, unknown> }) =>
      executeWorkflow(workflowId, triggerData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.executionsList(variables.workflowId) })
      queryClient.invalidateQueries({ queryKey: workflowKeys.executions() })
    },
  })
}
