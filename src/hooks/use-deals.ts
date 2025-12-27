'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDeals,
  getDealsByStage,
  getDeal,
  createDeal,
  updateDeal,
  moveDealToStage,
  updateDealStatus,
  deleteDeal,
  type DealFilters,
  type DealFormData,
} from '@/services/deals.service'

export const dealKeys = {
  all: ['deals'] as const,
  lists: () => [...dealKeys.all, 'list'] as const,
  list: (filters?: DealFilters) => [...dealKeys.lists(), filters] as const,
  byStage: () => [...dealKeys.all, 'by-stage'] as const,
  details: () => [...dealKeys.all, 'detail'] as const,
  detail: (id: string) => [...dealKeys.details(), id] as const,
}

export function useDeals(filters?: DealFilters) {
  return useQuery({
    queryKey: dealKeys.list(filters),
    queryFn: () => getDeals(filters),
  })
}

export function useDealsByStage() {
  return useQuery({
    queryKey: dealKeys.byStage(),
    queryFn: getDealsByStage,
  })
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: dealKeys.detail(id),
    queryFn: () => getDeal(id),
    enabled: !!id,
  })
}

export function useCreateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all })
    },
  })
}

export function useUpdateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DealFormData> }) =>
      updateDeal(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all })
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(id) })
    },
  })
}

export function useMoveDealToStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ dealId, stageId }: { dealId: string; stageId: string }) =>
      moveDealToStage(dealId, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all })
    },
  })
}

export function useUpdateDealStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
      lostReason,
    }: {
      id: string
      status: 'open' | 'won' | 'lost'
      lostReason?: string
    }) => updateDealStatus(id, status, lostReason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all })
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(id) })
    },
  })
}

export function useDeleteDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all })
    },
  })
}
