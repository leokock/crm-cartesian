'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getSalesReport,
  getPipelineReport,
  getActivityReport,
  getTeamPerformance,
  getClientRevenueReport,
  getDealsByPeriod,
  getReportSummary,
  type DateRange,
} from '@/services/reports.service'

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  sales: (dateRange: DateRange, groupBy: string) =>
    [...reportKeys.all, 'sales', dateRange.from.toISOString(), dateRange.to.toISOString(), groupBy] as const,
  pipeline: () => [...reportKeys.all, 'pipeline'] as const,
  activities: (dateRange: DateRange, groupBy: string) =>
    [...reportKeys.all, 'activities', dateRange.from.toISOString(), dateRange.to.toISOString(), groupBy] as const,
  team: (dateRange: DateRange) =>
    [...reportKeys.all, 'team', dateRange.from.toISOString(), dateRange.to.toISOString()] as const,
  clients: (dateRange: DateRange) =>
    [...reportKeys.all, 'clients', dateRange.from.toISOString(), dateRange.to.toISOString()] as const,
  dealsByPeriod: (dateRange: DateRange, groupBy: string) =>
    [...reportKeys.all, 'dealsByPeriod', dateRange.from.toISOString(), dateRange.to.toISOString(), groupBy] as const,
  summary: (dateRange: DateRange) =>
    [...reportKeys.all, 'summary', dateRange.from.toISOString(), dateRange.to.toISOString()] as const,
}

// Hooks
export function useSalesReport(
  dateRange: DateRange,
  groupBy: 'day' | 'week' | 'month' = 'month'
) {
  return useQuery({
    queryKey: reportKeys.sales(dateRange, groupBy),
    queryFn: () => getSalesReport(dateRange, groupBy),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePipelineReport() {
  return useQuery({
    queryKey: reportKeys.pipeline(),
    queryFn: getPipelineReport,
    staleTime: 5 * 60 * 1000,
  })
}

export function useActivityReport(
  dateRange: DateRange,
  groupBy: 'day' | 'week' | 'month' = 'month'
) {
  return useQuery({
    queryKey: reportKeys.activities(dateRange, groupBy),
    queryFn: () => getActivityReport(dateRange, groupBy),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTeamPerformance(dateRange: DateRange) {
  return useQuery({
    queryKey: reportKeys.team(dateRange),
    queryFn: () => getTeamPerformance(dateRange),
    staleTime: 5 * 60 * 1000,
  })
}

export function useClientRevenueReport(dateRange: DateRange) {
  return useQuery({
    queryKey: reportKeys.clients(dateRange),
    queryFn: () => getClientRevenueReport(dateRange),
    staleTime: 5 * 60 * 1000,
  })
}

export function useDealsByPeriod(
  dateRange: DateRange,
  groupBy: 'day' | 'week' | 'month' = 'month'
) {
  return useQuery({
    queryKey: reportKeys.dealsByPeriod(dateRange, groupBy),
    queryFn: () => getDealsByPeriod(dateRange, groupBy),
    staleTime: 5 * 60 * 1000,
  })
}

export function useReportSummary(dateRange: DateRange) {
  return useQuery({
    queryKey: reportKeys.summary(dateRange),
    queryFn: () => getReportSummary(dateRange),
    staleTime: 5 * 60 * 1000,
  })
}

// Helper hook for default date range (last 30 days)
export function useDefaultDateRange(): DateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 30)

  return { from, to }
}

// Helper hook for date range options
export function useDateRangePresets() {
  const today = new Date()

  return {
    last7Days: {
      from: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      to: today,
      label: 'Últimos 7 dias',
    },
    last30Days: {
      from: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30),
      to: today,
      label: 'Últimos 30 dias',
    },
    last90Days: {
      from: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 90),
      to: today,
      label: 'Últimos 90 dias',
    },
    thisMonth: {
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: today,
      label: 'Este mês',
    },
    lastMonth: {
      from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      to: new Date(today.getFullYear(), today.getMonth(), 0),
      label: 'Mês passado',
    },
    thisYear: {
      from: new Date(today.getFullYear(), 0, 1),
      to: today,
      label: 'Este ano',
    },
    lastYear: {
      from: new Date(today.getFullYear() - 1, 0, 1),
      to: new Date(today.getFullYear() - 1, 11, 31),
      label: 'Ano passado',
    },
  }
}
