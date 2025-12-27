import { createClient } from '@/lib/supabase/client'

// Types
export interface DateRange {
  from: Date
  to: Date
}

export interface SalesReport {
  period: string
  totalDeals: number
  wonDeals: number
  lostDeals: number
  openDeals: number
  totalValue: number
  wonValue: number
  lostValue: number
  conversionRate: number
}

export interface PipelineReport {
  stageId: string
  stageName: string
  stageColor: string
  dealsCount: number
  dealsValue: number
  avgDaysInStage: number
  conversionToNext: number
}

export interface ActivityReport {
  period: string
  totalActivities: number
  completedActivities: number
  pendingActivities: number
  completionRate: number
  byType: {
    type: string
    count: number
  }[]
}

export interface TeamPerformance {
  userId: string
  userName: string
  dealsWon: number
  dealsLost: number
  totalValue: number
  activitiesCompleted: number
  conversionRate: number
}

export interface ClientRevenue {
  clientId: string
  clientName: string
  totalDeals: number
  wonDeals: number
  totalValue: number
  wonValue: number
}

export interface DealsByPeriod {
  period: string
  won: number
  lost: number
  open: number
  value: number
}

// Helper to format period
function formatPeriod(date: Date, groupBy: 'day' | 'week' | 'month'): string {
  if (groupBy === 'day') {
    return date.toISOString().split('T')[0]
  } else if (groupBy === 'week') {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    return `Semana ${startOfWeek.toISOString().split('T')[0]}`
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }
}

// Sales Reports
export async function getSalesReport(
  dateRange: DateRange,
  groupBy: 'day' | 'week' | 'month' = 'month'
): Promise<SalesReport[]> {
  const supabase = createClient()

  const { data: deals, error } = await (supabase.from('deals') as any)
    .select('id, status, value, created_at, actual_close_date')
    .gte('created_at', dateRange.from.toISOString())
    .lte('created_at', dateRange.to.toISOString())

  if (error) throw error

  // Group deals by period
  const periodMap = new Map<string, SalesReport>()

  deals?.forEach((deal: any) => {
    const period = formatPeriod(new Date(deal.created_at), groupBy)

    if (!periodMap.has(period)) {
      periodMap.set(period, {
        period,
        totalDeals: 0,
        wonDeals: 0,
        lostDeals: 0,
        openDeals: 0,
        totalValue: 0,
        wonValue: 0,
        lostValue: 0,
        conversionRate: 0,
      })
    }

    const report = periodMap.get(period)!
    report.totalDeals++
    report.totalValue += Number(deal.value) || 0

    if (deal.status === 'won') {
      report.wonDeals++
      report.wonValue += Number(deal.value) || 0
    } else if (deal.status === 'lost') {
      report.lostDeals++
      report.lostValue += Number(deal.value) || 0
    } else {
      report.openDeals++
    }
  })

  // Calculate conversion rates
  periodMap.forEach((report) => {
    const closedDeals = report.wonDeals + report.lostDeals
    report.conversionRate = closedDeals > 0
      ? Math.round((report.wonDeals / closedDeals) * 100)
      : 0
  })

  return Array.from(periodMap.values()).sort((a, b) => a.period.localeCompare(b.period))
}

// Pipeline Report
export async function getPipelineReport(): Promise<PipelineReport[]> {
  const supabase = createClient()

  // Get stages
  const { data: stages, error: stagesError } = await (supabase.from('pipeline_stages') as any)
    .select('id, name, color, position')
    .order('position')

  if (stagesError) throw stagesError

  // Get deals with stage info
  const { data: deals, error: dealsError } = await (supabase.from('deals') as any)
    .select('id, stage_id, value, status, created_at, updated_at')
    .eq('status', 'open')

  if (dealsError) throw dealsError

  const reports: PipelineReport[] = stages?.map((stage: any) => {
    const stageDeals = deals?.filter((d: any) => d.stage_id === stage.id) || []
    const totalValue = stageDeals.reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0)

    return {
      stageId: stage.id,
      stageName: stage.name,
      stageColor: stage.color,
      dealsCount: stageDeals.length,
      dealsValue: totalValue,
      avgDaysInStage: 0, // Would need stage history to calculate
      conversionToNext: 0, // Would need historical data
    }
  }) || []

  return reports
}

// Activity Report
export async function getActivityReport(
  dateRange: DateRange,
  groupBy: 'day' | 'week' | 'month' = 'month'
): Promise<ActivityReport[]> {
  const supabase = createClient()

  const { data: activities, error } = await (supabase.from('activities') as any)
    .select('id, type, is_completed, due_date, completed_at, created_at')
    .gte('created_at', dateRange.from.toISOString())
    .lte('created_at', dateRange.to.toISOString())

  if (error) throw error

  const periodMap = new Map<string, ActivityReport>()

  activities?.forEach((activity: any) => {
    const period = formatPeriod(new Date(activity.created_at), groupBy)

    if (!periodMap.has(period)) {
      periodMap.set(period, {
        period,
        totalActivities: 0,
        completedActivities: 0,
        pendingActivities: 0,
        completionRate: 0,
        byType: [],
      })
    }

    const report = periodMap.get(period)!
    report.totalActivities++

    if (activity.is_completed) {
      report.completedActivities++
    } else {
      report.pendingActivities++
    }
  })

  // Calculate completion rates and type breakdown
  periodMap.forEach((report, period) => {
    report.completionRate = report.totalActivities > 0
      ? Math.round((report.completedActivities / report.totalActivities) * 100)
      : 0

    // Get type breakdown for this period
    const periodActivities = activities?.filter((a: any) =>
      formatPeriod(new Date(a.created_at), groupBy) === period
    ) || []

    const typeCount = new Map<string, number>()
    periodActivities.forEach((a: any) => {
      typeCount.set(a.type, (typeCount.get(a.type) || 0) + 1)
    })

    report.byType = Array.from(typeCount.entries()).map(([type, count]) => ({
      type,
      count,
    }))
  })

  return Array.from(periodMap.values()).sort((a, b) => a.period.localeCompare(b.period))
}

// Team Performance
export async function getTeamPerformance(dateRange: DateRange): Promise<TeamPerformance[]> {
  const supabase = createClient()

  // Get team members
  const { data: profiles, error: profilesError } = await (supabase.from('profiles') as any)
    .select('id, full_name')

  if (profilesError) throw profilesError

  // Get deals
  const { data: deals, error: dealsError } = await (supabase.from('deals') as any)
    .select('id, owner_id, status, value, actual_close_date')
    .gte('created_at', dateRange.from.toISOString())
    .lte('created_at', dateRange.to.toISOString())

  if (dealsError) throw dealsError

  // Get activities
  const { data: activities, error: activitiesError } = await (supabase.from('activities') as any)
    .select('id, owner_id, is_completed')
    .gte('created_at', dateRange.from.toISOString())
    .lte('created_at', dateRange.to.toISOString())
    .eq('is_completed', true)

  if (activitiesError) throw activitiesError

  const performance: TeamPerformance[] = profiles?.map((profile: any) => {
    const userDeals = deals?.filter((d: any) => d.owner_id === profile.id) || []
    const wonDeals = userDeals.filter((d: any) => d.status === 'won')
    const lostDeals = userDeals.filter((d: any) => d.status === 'lost')
    const userActivities = activities?.filter((a: any) => a.owner_id === profile.id) || []

    const closedDeals = wonDeals.length + lostDeals.length
    const conversionRate = closedDeals > 0
      ? Math.round((wonDeals.length / closedDeals) * 100)
      : 0

    return {
      userId: profile.id,
      userName: profile.full_name || 'Sem nome',
      dealsWon: wonDeals.length,
      dealsLost: lostDeals.length,
      totalValue: wonDeals.reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0),
      activitiesCompleted: userActivities.length,
      conversionRate,
    }
  }) || []

  return performance.sort((a, b) => b.totalValue - a.totalValue)
}

// Client Revenue Report
export async function getClientRevenueReport(dateRange: DateRange): Promise<ClientRevenue[]> {
  const supabase = createClient()

  const { data: deals, error } = await (supabase.from('deals') as any)
    .select(`
      id,
      status,
      value,
      company_id,
      companies!inner(id, name)
    `)
    .gte('created_at', dateRange.from.toISOString())
    .lte('created_at', dateRange.to.toISOString())

  if (error) throw error

  const clientMap = new Map<string, ClientRevenue>()

  deals?.forEach((deal: any) => {
    const companyId = deal.company_id
    const companyName = deal.companies?.name || 'Sem empresa'

    if (!clientMap.has(companyId)) {
      clientMap.set(companyId, {
        clientId: companyId,
        clientName: companyName,
        totalDeals: 0,
        wonDeals: 0,
        totalValue: 0,
        wonValue: 0,
      })
    }

    const client = clientMap.get(companyId)!
    client.totalDeals++
    client.totalValue += Number(deal.value) || 0

    if (deal.status === 'won') {
      client.wonDeals++
      client.wonValue += Number(deal.value) || 0
    }
  })

  return Array.from(clientMap.values()).sort((a, b) => b.wonValue - a.wonValue)
}

// Deals by Period (for charts)
export async function getDealsByPeriod(
  dateRange: DateRange,
  groupBy: 'day' | 'week' | 'month' = 'month'
): Promise<DealsByPeriod[]> {
  const supabase = createClient()

  const { data: deals, error } = await (supabase.from('deals') as any)
    .select('id, status, value, created_at')
    .gte('created_at', dateRange.from.toISOString())
    .lte('created_at', dateRange.to.toISOString())

  if (error) throw error

  const periodMap = new Map<string, DealsByPeriod>()

  deals?.forEach((deal: any) => {
    const period = formatPeriod(new Date(deal.created_at), groupBy)

    if (!periodMap.has(period)) {
      periodMap.set(period, {
        period,
        won: 0,
        lost: 0,
        open: 0,
        value: 0,
      })
    }

    const data = periodMap.get(period)!
    data.value += Number(deal.value) || 0

    if (deal.status === 'won') {
      data.won++
    } else if (deal.status === 'lost') {
      data.lost++
    } else {
      data.open++
    }
  })

  return Array.from(periodMap.values()).sort((a, b) => a.period.localeCompare(b.period))
}

// Summary stats for dashboard
export async function getReportSummary(dateRange: DateRange) {
  const supabase = createClient()

  // Get deals in period
  const { data: deals, error: dealsError } = await (supabase.from('deals') as any)
    .select('id, status, value')
    .gte('created_at', dateRange.from.toISOString())
    .lte('created_at', dateRange.to.toISOString())

  if (dealsError) throw dealsError

  // Get activities in period
  const { data: activities, error: activitiesError } = await (supabase.from('activities') as any)
    .select('id, is_completed')
    .gte('created_at', dateRange.from.toISOString())
    .lte('created_at', dateRange.to.toISOString())

  if (activitiesError) throw activitiesError

  const wonDeals = deals?.filter((d: any) => d.status === 'won') || []
  const lostDeals = deals?.filter((d: any) => d.status === 'lost') || []
  const completedActivities = activities?.filter((a: any) => a.is_completed) || []

  const closedDeals = wonDeals.length + lostDeals.length
  const conversionRate = closedDeals > 0
    ? Math.round((wonDeals.length / closedDeals) * 100)
    : 0

  return {
    totalDeals: deals?.length || 0,
    wonDeals: wonDeals.length,
    lostDeals: lostDeals.length,
    openDeals: (deals?.length || 0) - closedDeals,
    totalValue: deals?.reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0) || 0,
    wonValue: wonDeals.reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0),
    conversionRate,
    totalActivities: activities?.length || 0,
    completedActivities: completedActivities.length,
    activityCompletionRate: activities?.length
      ? Math.round((completedActivities.length / activities.length) * 100)
      : 0,
  }
}

// Export utilities
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers: { key: keyof T; label: string }[]
): void {
  const headerRow = headers.map(h => h.label).join(',')
  const rows = data.map(item =>
    headers.map(h => {
      const value = item[h.key]
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`
      }
      return String(value ?? '')
    }).join(',')
  )

  const csv = [headerRow, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
}
