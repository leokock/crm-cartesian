import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import type { ProjectFormData } from '@/lib/validations'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

type TypedSupabaseClient = ReturnType<typeof createClient>

function getSupabase(): TypedSupabaseClient {
  return createClient()
}

export interface ProjectWithRelations extends Project {
  company: { id: string; name: string; cnpj?: string | null; phone?: string | null } | null
  owner: { id: string; full_name: string | null; avatar_url: string | null; email?: string } | null
  created_by_user?: { id: string; full_name: string | null } | null
  deals?: {
    id: string
    title: string
    value: number | null
    status: string
    expected_close_date: string | null
    stage: { id: string; name: string; color: string; probability: number } | null
  }[]
}

export interface ProjectFilters {
  search?: string
  company_id?: string
  status?: 'active' | 'completed' | 'cancelled'
  project_type?: string
  owner_id?: string
}

export async function getProjects(filters?: ProjectFilters) {
  const supabase = getSupabase()
  let query = supabase
    .from('projects')
    .select(`
      *,
      company:companies(id, name),
      owner:profiles!projects_owner_id_fkey(id, full_name, avatar_url),
      deals:deals(count)
    `)
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
  }

  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.project_type) {
    query = query.eq('project_type', filters.project_type)
  }

  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getProjectsByCompany(companyId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      deals:deals(count)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProject(id: string): Promise<ProjectWithRelations> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      company:companies(id, name, cnpj, phone),
      owner:profiles!projects_owner_id_fkey(id, full_name, avatar_url, email),
      created_by_user:profiles!projects_created_by_fkey(id, full_name),
      deals:deals(
        id, title, value, status, expected_close_date,
        stage:pipeline_stages(id, name, color, probability)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as ProjectWithRelations
}

export async function createProject(formData: ProjectFormData) {
  const supabase = getSupabase()
  const { data: user } = await supabase.auth.getUser()
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .single()

  if (profileError || !profileData || !user.user) throw new Error('Usuário não autenticado')
  const profile = profileData as { organization_id: string }

  const insertData: ProjectInsert = {
    organization_id: profile.organization_id,
    company_id: formData.company_id,
    name: formData.name,
    description: formData.description || null,
    area_m2: formData.area_m2 || null,
    project_type: formData.project_type || null,
    location: formData.location || null,
    status: formData.status,
    start_date: formData.start_date || null,
    expected_end_date: formData.expected_end_date || null,
    owner_id: user.user.id,
    created_by: user.user.id,
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(insertData as any)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function updateProject(id: string, formData: ProjectFormData) {
  const supabase = getSupabase()
  const updateData: ProjectUpdate = {
    company_id: formData.company_id,
    name: formData.name,
    description: formData.description || null,
    area_m2: formData.area_m2 || null,
    project_type: formData.project_type || null,
    location: formData.location || null,
    status: formData.status,
    start_date: formData.start_date || null,
    expected_end_date: formData.expected_end_date || null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('projects') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function deleteProject(id: string) {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function updateProjectStatus(id: string, status: 'active' | 'completed' | 'cancelled') {
  const supabase = getSupabase()
  const updateData: ProjectUpdate = { status }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('projects') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Project
}
