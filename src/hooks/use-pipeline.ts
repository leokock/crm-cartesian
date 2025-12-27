'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPipelineStages,
  getPipelineStagesWithDealsCount,
  getPipelineStage,
  createPipelineStage,
  updatePipelineStage,
  reorderPipelineStages,
  deletePipelineStage,
  type StageFormData,
} from '@/services/pipeline.service'

export const pipelineKeys = {
  all: ['pipeline'] as const,
  stages: () => [...pipelineKeys.all, 'stages'] as const,
  stagesWithCount: () => [...pipelineKeys.all, 'stages-with-count'] as const,
  stage: (id: string) => [...pipelineKeys.all, 'stage', id] as const,
}

export function usePipelineStages() {
  return useQuery({
    queryKey: pipelineKeys.stages(),
    queryFn: getPipelineStages,
  })
}

export function usePipelineStagesWithDealsCount() {
  return useQuery({
    queryKey: pipelineKeys.stagesWithCount(),
    queryFn: getPipelineStagesWithDealsCount,
  })
}

export function usePipelineStage(id: string) {
  return useQuery({
    queryKey: pipelineKeys.stage(id),
    queryFn: () => getPipelineStage(id),
    enabled: !!id,
  })
}

export function useCreatePipelineStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPipelineStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.all })
    },
  })
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StageFormData }) =>
      updatePipelineStage(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.all })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.stage(id) })
    },
  })
}

export function useReorderPipelineStages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reorderPipelineStages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.all })
    },
  })
}

export function useDeletePipelineStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePipelineStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.all })
    },
  })
}
