'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActivities,
  getActivity,
  getUpcomingActivities,
  getOverdueActivities,
  createActivity,
  updateActivity,
  toggleActivityComplete,
  deleteActivity,
  type ActivityFilters,
  type ActivityFormData,
} from '@/services/activities.service'

export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters?: ActivityFilters) => [...activityKeys.lists(), filters] as const,
  upcoming: (limit?: number) => [...activityKeys.all, 'upcoming', limit] as const,
  overdue: () => [...activityKeys.all, 'overdue'] as const,
  details: () => [...activityKeys.all, 'detail'] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
}

export function useActivities(filters?: ActivityFilters) {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: () => getActivities(filters),
  })
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => getActivity(id),
    enabled: !!id,
  })
}

export function useUpcomingActivities(limit = 10) {
  return useQuery({
    queryKey: activityKeys.upcoming(limit),
    queryFn: () => getUpcomingActivities(limit),
  })
}

export function useOverdueActivities() {
  return useQuery({
    queryKey: activityKeys.overdue(),
    queryFn: () => getOverdueActivities(),
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ActivityFormData) => createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}

export function useUpdateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ActivityFormData> }) =>
      updateActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}

export function useToggleActivityComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      toggleActivityComplete(id, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}

export function useDeleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}
