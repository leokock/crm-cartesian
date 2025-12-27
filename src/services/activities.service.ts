import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Activity = Database['public']['Tables']['activities']['Row']
type ActivityInsert = Database['public']['Tables']['activities']['Insert']
type ActivityUpdate = Database['public']['Tables']['activities']['Update']
type ActivityType = Activity['type']

type TypedSupabaseClient = ReturnType<typeof createClient>

function getSupabase(): TypedSupabaseClient {
  return createClient()
}

export interface ActivityWithRelations extends Activity {
  company: { id: string; name: string } | null
  contact: { id: string; first_name: string; last_name: string | null } | null
  deal: { id: string; title: string } | null
  project: { id: string; name: string } | null
  owner: { id: string; full_name: string | null; avatar_url: string | null } | null
}

export interface ActivityFormData {
  type: ActivityType
  title: string
  description?: string | null
  due_date?: string | null
  company_id?: string | null
  contact_id?: string | null
  deal_id?: string | null
  project_id?: string | null
}

export interface ActivityFilters {
  search?: string
  type?: ActivityType
  is_completed?: boolean
  company_id?: string
  contact_id?: string
  deal_id?: string
  project_id?: string
  owner_id?: string
  due_date_from?: string
  due_date_to?: string
}

export const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: string }[] = [
  { value: 'call', label: 'Ligação', icon: 'Phone' },
  { value: 'meeting', label: 'Reunião', icon: 'Users' },
  { value: 'email', label: 'E-mail', icon: 'Mail' },
  { value: 'task', label: 'Tarefa', icon: 'CheckSquare' },
  { value: 'note', label: 'Nota', icon: 'FileText' },
  { value: 'visit', label: 'Visita', icon: 'MapPin' },
]

export async function getActivities(filters?: ActivityFilters) {
  const supabase = getSupabase()
  let query = supabase
    .from('activities')
    .select(`
      *,
      company:companies(id, name),
      contact:contacts(id, first_name, last_name),
      deal:deals(id, title),
      project:projects(id, name),
      owner:profiles!activities_owner_id_fkey(id, full_name, avatar_url)
    `)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.is_completed !== undefined) {
    query = query.eq('is_completed', filters.is_completed)
  }

  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id)
  }

  if (filters?.contact_id) {
    query = query.eq('contact_id', filters.contact_id)
  }

  if (filters?.deal_id) {
    query = query.eq('deal_id', filters.deal_id)
  }

  if (filters?.project_id) {
    query = query.eq('project_id', filters.project_id)
  }

  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id)
  }

  if (filters?.due_date_from) {
    query = query.gte('due_date', filters.due_date_from)
  }

  if (filters?.due_date_to) {
    query = query.lte('due_date', filters.due_date_to)
  }

  const { data, error } = await query

  if (error) throw error
  return data as unknown as ActivityWithRelations[]
}

export async function getUpcomingActivities(limit = 10) {
  const supabase = getSupabase()
  const today = new Date().toISOString()

  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      company:companies(id, name),
      contact:contacts(id, first_name, last_name),
      deal:deals(id, title),
      project:projects(id, name),
      owner:profiles!activities_owner_id_fkey(id, full_name, avatar_url)
    `)
    .eq('is_completed', false)
    .gte('due_date', today)
    .order('due_date', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data as unknown as ActivityWithRelations[]
}

export async function getOverdueActivities() {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      company:companies(id, name),
      contact:contacts(id, first_name, last_name),
      deal:deals(id, title),
      project:projects(id, name),
      owner:profiles!activities_owner_id_fkey(id, full_name, avatar_url)
    `)
    .eq('is_completed', false)
    .lt('due_date', today)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data as unknown as ActivityWithRelations[]
}

export async function getActivity(id: string): Promise<ActivityWithRelations> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      company:companies(id, name),
      contact:contacts(id, first_name, last_name),
      deal:deals(id, title),
      project:projects(id, name),
      owner:profiles!activities_owner_id_fkey(id, full_name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as ActivityWithRelations
}

export async function createActivity(formData: ActivityFormData) {
  const supabase = getSupabase()
  const { data: user } = await supabase.auth.getUser()
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .single()

  if (profileError || !profileData || !user.user) throw new Error('Usuário não autenticado')
  const profile = profileData as { organization_id: string }

  const insertData: ActivityInsert = {
    organization_id: profile.organization_id,
    type: formData.type,
    title: formData.title,
    description: formData.description || null,
    due_date: formData.due_date || null,
    company_id: formData.company_id || null,
    contact_id: formData.contact_id || null,
    deal_id: formData.deal_id || null,
    project_id: formData.project_id || null,
    owner_id: user.user.id,
    created_by: user.user.id,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('activities') as any)
    .insert(insertData)
    .select()
    .single()

  if (error) throw error
  return data as Activity
}

export async function updateActivity(id: string, formData: Partial<ActivityFormData>) {
  const supabase = getSupabase()
  const updateData: ActivityUpdate = {}

  if (formData.type !== undefined) updateData.type = formData.type
  if (formData.title !== undefined) updateData.title = formData.title
  if (formData.description !== undefined) updateData.description = formData.description || null
  if (formData.due_date !== undefined) updateData.due_date = formData.due_date || null
  if (formData.company_id !== undefined) updateData.company_id = formData.company_id || null
  if (formData.contact_id !== undefined) updateData.contact_id = formData.contact_id || null
  if (formData.deal_id !== undefined) updateData.deal_id = formData.deal_id || null
  if (formData.project_id !== undefined) updateData.project_id = formData.project_id || null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('activities') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Activity
}

export async function toggleActivityComplete(id: string, isCompleted: boolean) {
  const supabase = getSupabase()
  const updateData: ActivityUpdate = {
    is_completed: isCompleted,
    completed_at: isCompleted ? new Date().toISOString() : null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('activities') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Activity
}

export async function deleteActivity(id: string) {
  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('activities') as any)
    .delete()
    .eq('id', id)

  if (error) throw error
}
