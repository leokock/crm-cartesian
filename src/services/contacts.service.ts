import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import type { ContactFormData } from '@/lib/validations'

type Contact = Database['public']['Tables']['contacts']['Row']
type ContactInsert = Database['public']['Tables']['contacts']['Insert']
type ContactUpdate = Database['public']['Tables']['contacts']['Update']

type TypedSupabaseClient = ReturnType<typeof createClient>

function getSupabase(): TypedSupabaseClient {
  return createClient()
}

export interface ContactWithRelations extends Contact {
  company: { id: string; name: string; phone?: string | null; website?: string | null } | null
  owner: { id: string; full_name: string | null; avatar_url: string | null; email?: string } | null
  created_by_user?: { id: string; full_name: string | null } | null
  deals?: {
    deal: {
      id: string
      title: string
      value: number | null
      status: string
      stage: { name: string; color: string } | null
    }
  }[]
}

export interface ContactFilters {
  search?: string
  company_id?: string
  tags?: string[]
  owner_id?: string
}

export async function getContacts(filters?: ContactFilters) {
  const supabase = getSupabase()
  let query = supabase
    .from('contacts')
    .select(`
      *,
      company:companies(id, name),
      owner:profiles!contacts_owner_id_fkey(id, full_name, avatar_url)
    `)
    .order('first_name')

  if (filters?.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id)
  }

  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getContactsByCompany(companyId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', companyId)
    .order('first_name')

  if (error) throw error
  return data as Contact[]
}

export async function getContact(id: string): Promise<ContactWithRelations> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      company:companies(id, name, phone, website),
      owner:profiles!contacts_owner_id_fkey(id, full_name, avatar_url, email),
      created_by_user:profiles!contacts_created_by_fkey(id, full_name),
      deals:deal_contacts(
        deal:deals(id, title, value, status, stage:pipeline_stages(name, color))
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as ContactWithRelations
}

export async function createContact(formData: ContactFormData) {
  const supabase = getSupabase()
  const { data: user } = await supabase.auth.getUser()
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .single()

  if (profileError || !profileData || !user.user) throw new Error('Usuário não autenticado')
  const profile = profileData as { organization_id: string }

  const insertData: ContactInsert = {
    organization_id: profile.organization_id,
    first_name: formData.first_name,
    last_name: formData.last_name || null,
    email: formData.email || null,
    phone: formData.phone || null,
    mobile: formData.mobile || null,
    job_title: formData.job_title || null,
    department: formData.department || null,
    company_id: formData.company_id || null,
    source: formData.source || null,
    tags: formData.tags || [],
    owner_id: user.user.id,
    created_by: user.user.id,
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert(insertData as any)
    .select()
    .single()

  if (error) throw error
  return data as Contact
}

export async function updateContact(id: string, formData: ContactFormData) {
  const supabase = getSupabase()
  const updateData: ContactUpdate = {
    first_name: formData.first_name,
    last_name: formData.last_name || null,
    email: formData.email || null,
    phone: formData.phone || null,
    mobile: formData.mobile || null,
    job_title: formData.job_title || null,
    department: formData.department || null,
    company_id: formData.company_id || null,
    source: formData.source || null,
    tags: formData.tags || [],
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('contacts') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Contact
}

export async function deleteContact(id: string) {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function searchContacts(query: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email, company:companies(name)')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10)

  if (error) throw error
  return data
}
