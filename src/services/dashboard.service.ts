import { createClient } from '@/lib/supabase/client'

type TypedSupabaseClient = ReturnType<typeof createClient>

function getSupabase(): TypedSupabaseClient {
  return createClient()
}

export interface DashboardStats {
  openDeals: number
  totalValue: number
  totalClients: number
  pendingActivities: number
  overdueActivities: number
  wonDealsThisMonth: number
  wonValueThisMonth: number
}

export interface PipelineStats {
  stage_id: string
  stage_name: string
  stage_color: string
  count: number
  total_value: number
}

export interface RecentDeal {
  id: string
  title: string
  value: number | null
  expected_close_date: string | null
  stage: { id: string; name: string; color: string } | null
  company: { id: string; name: string } | null
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabase()
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const today = now.toISOString().split('T')[0]

  // Get open deals count and value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: openDealsData } = await (supabase.from('deals') as any)
    .select('id, value')
    .eq('status', 'open')
  const openDeals = openDealsData as { id: string; value: number | null }[] | null

  // Get total clients
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: totalClients } = await (supabase.from('companies') as any)
    .select('id', { count: 'exact', head: true })

  // Get pending activities
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: pendingActivities } = await (supabase.from('activities') as any)
    .select('id', { count: 'exact', head: true })
    .eq('is_completed', false)

  // Get overdue activities
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: overdueActivities } = await (supabase.from('activities') as any)
    .select('id', { count: 'exact', head: true })
    .eq('is_completed', false)
    .lt('due_date', today)

  // Get won deals this month
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: wonDealsData } = await (supabase.from('deals') as any)
    .select('id, value')
    .eq('status', 'won')
    .gte('closed_at', firstDayOfMonth)
  const wonDeals = wonDealsData as { id: string; value: number | null }[] | null

  const openDealsCount = openDeals?.length || 0
  const totalValue = openDeals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0
  const wonDealsThisMonth = wonDeals?.length || 0
  const wonValueThisMonth = wonDeals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0

  return {
    openDeals: openDealsCount,
    totalValue,
    totalClients: totalClients || 0,
    pendingActivities: pendingActivities || 0,
    overdueActivities: overdueActivities || 0,
    wonDealsThisMonth,
    wonValueThisMonth,
  }
}

export async function getPipelineStats(): Promise<PipelineStats[]> {
  const supabase = getSupabase()

  // Get all stages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stagesData } = await (supabase.from('pipeline_stages') as any)
    .select('id, name, color, position')
    .order('position', { ascending: true })
  const stages = stagesData as { id: string; name: string; color: string; position: number }[] | null

  if (!stages) return []

  // Get deals by stage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dealsData } = await (supabase.from('deals') as any)
    .select('stage_id, value')
    .eq('status', 'open')
  const deals = dealsData as { stage_id: string; value: number | null }[] | null

  const dealsByStage = deals?.reduce((acc, deal) => {
    if (!acc[deal.stage_id]) {
      acc[deal.stage_id] = { count: 0, total_value: 0 }
    }
    acc[deal.stage_id].count++
    acc[deal.stage_id].total_value += deal.value || 0
    return acc
  }, {} as Record<string, { count: number; total_value: number }>)

  return stages.map((stage) => ({
    stage_id: stage.id,
    stage_name: stage.name,
    stage_color: stage.color,
    count: dealsByStage?.[stage.id]?.count || 0,
    total_value: dealsByStage?.[stage.id]?.total_value || 0,
  }))
}

export async function getRecentDeals(limit = 5): Promise<RecentDeal[]> {
  const supabase = getSupabase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('deals') as any)
    .select(`
      id,
      title,
      value,
      expected_close_date,
      stage:pipeline_stages(id, name, color),
      company:companies(id, name)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as RecentDeal[]
}

export async function getDealsNearClosing(limit = 5): Promise<RecentDeal[]> {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('deals') as any)
    .select(`
      id,
      title,
      value,
      expected_close_date,
      stage:pipeline_stages(id, name, color),
      company:companies(id, name)
    `)
    .eq('status', 'open')
    .gte('expected_close_date', today)
    .lte('expected_close_date', nextWeek)
    .order('expected_close_date', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data as RecentDeal[]
}
