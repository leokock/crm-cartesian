import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import type { CompanyFormData } from '@/lib/validations'

type Company = Database['public']['Tables']['companies']['Row']
type CompanyInsert = Database['public']['Tables']['companies']['Insert']
type CompanyUpdate = Database['public']['Tables']['companies']['Update']

// Helper type for Supabase client
type TypedSupabaseClient = ReturnType<typeof createClient>

export interface ClientListItem extends Company {
  owner: { id: string; full_name: string | null; avatar_url: string | null } | null
  projects: { count: number }[]
}

export interface ClientWithRelations extends Company {
  owner: { id: string; full_name: string | null; avatar_url: string | null; email?: string } | null
  created_by_user?: { id: string; full_name: string | null } | null
  projects: {
    id: string
    name: string
    status: string
    project_type: string | null
    area_m2: number | null
    created_at: string
    deals: { count: number }[]
  }[]
  contacts: {
    id: string
    first_name: string
    last_name: string | null
    email: string | null
    phone: string | null
    job_title: string | null
  }[]
}

function getSupabase(): TypedSupabaseClient {
  return createClient()
}

export interface ClientFilters {
  search?: string
  industry?: string
  tags?: string[]
  owner_id?: string
}

export async function getClients(filters?: ClientFilters): Promise<ClientListItem[]> {
  const supabase = getSupabase()
  let query = supabase
    .from('companies')
    .select(`
      *,
      owner:profiles!companies_owner_id_fkey(id, full_name, avatar_url),
      projects:projects(count)
    `)
    .order('name')

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%`)
  }

  if (filters?.industry) {
    query = query.eq('industry', filters.industry)
  }

  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  const { data, error } = await query

  if (error) throw error
  return data as unknown as ClientListItem[]
}

export async function getClient(id: string): Promise<ClientWithRelations> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      owner:profiles!companies_owner_id_fkey(id, full_name, avatar_url, email),
      created_by_user:profiles!companies_created_by_fkey(id, full_name),
      projects:projects(
        id, name, status, project_type, area_m2, created_at,
        deals:deals(count)
      ),
      contacts:contacts(id, first_name, last_name, email, phone, job_title)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as ClientWithRelations
}

export async function createCompany(formData: CompanyFormData) {
  const supabase = getSupabase()
  const { data: user } = await supabase.auth.getUser()
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .single()

  if (profileError || !profileData || !user.user) throw new Error('Usuário não autenticado')
  const profile = profileData as { organization_id: string }

  const insertData: CompanyInsert = {
    organization_id: profile.organization_id,
    name: formData.name,
    cnpj: formData.cnpj || null,
    domain: formData.domain || null,
    industry: formData.industry || null,
    size: formData.size || null,
    website: formData.website || null,
    phone: formData.phone || null,
    address: formData.address || null,
    tags: formData.tags || [],
    owner_id: user.user.id,
    created_by: user.user.id,
  }

  const { data, error } = await supabase
    .from('companies')
    .insert(insertData as any)
    .select()
    .single()

  if (error) throw error
  return data as Company
}

export async function updateClient(id: string, formData: CompanyFormData) {
  const supabase = getSupabase()
  const updateData: CompanyUpdate = {
    name: formData.name,
    cnpj: formData.cnpj || null,
    domain: formData.domain || null,
    industry: formData.industry || null,
    size: formData.size || null,
    website: formData.website || null,
    phone: formData.phone || null,
    address: formData.address || null,
    tags: formData.tags || [],
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('companies') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Company
}

export async function deleteClient(id: string) {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getIndustries() {
  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('companies') as any)
    .select('industry')
    .not('industry', 'is', null)

  if (error) throw error

  const industries = [...new Set((data as { industry: string }[]).map((c) => c.industry).filter(Boolean))]
  return industries as string[]
}
