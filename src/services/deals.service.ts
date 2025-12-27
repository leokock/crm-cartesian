import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Deal = Database['public']['Tables']['deals']['Row']
type DealInsert = Database['public']['Tables']['deals']['Insert']
type DealUpdate = Database['public']['Tables']['deals']['Update']

type TypedSupabaseClient = ReturnType<typeof createClient>

function getSupabase(): TypedSupabaseClient {
  return createClient()
}

export interface DealWithRelations extends Deal {
  company: { id: string; name: string } | null
  project: { id: string; name: string } | null
  contact: { id: string; first_name: string; last_name: string | null } | null
  stage: { id: string; name: string; color: string; probability: number } | null
  owner: { id: string; full_name: string | null; avatar_url: string | null } | null
  solutions?: {
    id: string
    solution: { id: string; name: string }
    quantity: number
    unit_price: number | null
  }[]
}

export interface DealFormData {
  company_id: string
  project_id?: string | null
  contact_id?: string | null
  stage_id: string
  title: string
  description?: string | null
  value?: number | null
  expected_close_date?: string | null
}

export interface DealFilters {
  search?: string
  company_id?: string
  project_id?: string
  stage_id?: string
  status?: 'open' | 'won' | 'lost'
  owner_id?: string
}

export async function getDeals(filters?: DealFilters) {
  const supabase = getSupabase()
  let query = supabase
    .from('deals')
    .select(`
      *,
      company:companies(id, name),
      project:projects(id, name),
      contact:contacts(id, first_name, last_name),
      stage:pipeline_stages(id, name, color, probability),
      owner:profiles!deals_owner_id_fkey(id, full_name, avatar_url)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%`)
  }

  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id)
  }

  if (filters?.project_id) {
    query = query.eq('project_id', filters.project_id)
  }

  if (filters?.stage_id) {
    query = query.eq('stage_id', filters.stage_id)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data as unknown as DealWithRelations[]
}

export async function getDealsByStage() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      company:companies(id, name),
      project:projects(id, name),
      contact:contacts(id, first_name, last_name),
      stage:pipeline_stages(id, name, color, probability),
      owner:profiles!deals_owner_id_fkey(id, full_name, avatar_url)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as DealWithRelations[]
}

export async function getDeal(id: string): Promise<DealWithRelations> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      company:companies(id, name),
      project:projects(id, name),
      contact:contacts(id, first_name, last_name),
      stage:pipeline_stages(id, name, color, probability),
      owner:profiles!deals_owner_id_fkey(id, full_name, avatar_url, email),
      solutions:deal_solutions(
        id,
        quantity,
        unit_price,
        solution:solutions(id, name)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as DealWithRelations
}

export async function createDeal(formData: DealFormData) {
  const supabase = getSupabase()
  const { data: user } = await supabase.auth.getUser()
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .single()

  if (profileError || !profileData || !user.user) throw new Error('Usuário não autenticado')
  const profile = profileData as { organization_id: string }

  const insertData: DealInsert = {
    organization_id: profile.organization_id,
    company_id: formData.company_id,
    project_id: formData.project_id || null,
    contact_id: formData.contact_id || null,
    stage_id: formData.stage_id,
    title: formData.title,
    description: formData.description || null,
    value: formData.value || null,
    expected_close_date: formData.expected_close_date || null,
    owner_id: user.user.id,
    created_by: user.user.id,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('deals') as any)
    .insert(insertData)
    .select()
    .single()

  if (error) throw error
  return data as Deal
}

export async function updateDeal(id: string, formData: Partial<DealFormData>) {
  const supabase = getSupabase()
  const updateData: DealUpdate = {}

  if (formData.company_id !== undefined) updateData.company_id = formData.company_id
  if (formData.project_id !== undefined) updateData.project_id = formData.project_id || null
  if (formData.contact_id !== undefined) updateData.contact_id = formData.contact_id || null
  if (formData.stage_id !== undefined) updateData.stage_id = formData.stage_id
  if (formData.title !== undefined) updateData.title = formData.title
  if (formData.description !== undefined) updateData.description = formData.description || null
  if (formData.value !== undefined) updateData.value = formData.value || null
  if (formData.expected_close_date !== undefined) updateData.expected_close_date = formData.expected_close_date || null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('deals') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Deal
}

export async function moveDealToStage(dealId: string, stageId: string) {
  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('deals') as any)
    .update({ stage_id: stageId })
    .eq('id', dealId)
    .select()
    .single()

  if (error) throw error
  return data as Deal
}

export async function updateDealStatus(id: string, status: 'open' | 'won' | 'lost', lostReason?: string) {
  const supabase = getSupabase()
  const updateData: DealUpdate = {
    status,
    actual_close_date: status !== 'open' ? new Date().toISOString().split('T')[0] : null,
    lost_reason: status === 'lost' ? lostReason || null : null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('deals') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Deal
}

export async function deleteDeal(id: string) {
  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('deals') as any)
    .delete()
    .eq('id', id)

  if (error) throw error
}
