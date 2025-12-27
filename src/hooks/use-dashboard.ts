'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getDashboardStats,
  getPipelineStats,
  getRecentDeals,
  getDealsNearClosing,
} from '@/services/dashboard.service'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  pipeline: () => [...dashboardKeys.all, 'pipeline'] as const,
  recentDeals: () => [...dashboardKeys.all, 'recent-deals'] as const,
  nearClosing: () => [...dashboardKeys.all, 'near-closing'] as const,
}

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function usePipelineStats() {
  return useQuery({
    queryKey: dashboardKeys.pipeline(),
    queryFn: getPipelineStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useRecentDeals(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.recentDeals(),
    queryFn: () => getRecentDeals(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useDealsNearClosing(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.nearClosing(),
    queryFn: () => getDealsNearClosing(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
