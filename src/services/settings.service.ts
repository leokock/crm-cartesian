import { createClient } from '@/lib/supabase/client'

type TypedSupabaseClient = ReturnType<typeof createClient>

function getSupabase(): TypedSupabaseClient {
  return createClient()
}

export interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  job_title: string | null
  email: string
  role: 'admin' | 'manager' | 'sales_rep'
  organization_id: string
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  website: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  role: 'admin' | 'manager' | 'sales_rep'
  job_title: string | null
  created_at: string
}

export interface ProfileUpdateData {
  full_name?: string
  phone?: string
  job_title?: string
  avatar_url?: string
}

export interface OrganizationUpdateData {
  name?: string
  website?: string
  phone?: string
  address?: string
  logo_url?: string
}

export async function getCurrentProfile(): Promise<UserProfile> {
  const supabase = getSupabase()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) throw new Error('Usuário não autenticado')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('profiles') as any)
    .select('*')
    .eq('id', user.user.id)
    .single()

  if (error) throw error

  return {
    ...data,
    email: user.user.email || '',
  } as UserProfile
}

export async function updateProfile(profileData: ProfileUpdateData): Promise<UserProfile> {
  const supabase = getSupabase()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) throw new Error('Usuário não autenticado')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('profiles') as any)
    .update(profileData)
    .eq('id', user.user.id)
    .select()
    .single()

  if (error) throw error

  return {
    ...data,
    email: user.user.email || '',
  } as UserProfile
}

export async function getCurrentOrganization(): Promise<Organization> {
  const supabase = getSupabase()

  // Get user's organization_id first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('organization_id')
    .single()

  if (!profile?.organization_id) throw new Error('Organização não encontrada')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('organizations') as any)
    .select('*')
    .eq('id', profile.organization_id)
    .single()

  if (error) throw error
  return data as Organization
}

export async function updateOrganization(orgData: OrganizationUpdateData): Promise<Organization> {
  const supabase = getSupabase()

  // Get user's organization_id first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('organization_id')
    .single()

  if (!profile?.organization_id) throw new Error('Organização não encontrada')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('organizations') as any)
    .update(orgData)
    .eq('id', profile.organization_id)
    .select()
    .single()

  if (error) throw error
  return data as Organization
}

export async function getOrganizationMembers(): Promise<OrganizationMember[]> {
  const supabase = getSupabase()

  // Get user's organization_id first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('organization_id')
    .single()

  if (!profile?.organization_id) throw new Error('Organização não encontrada')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('profiles') as any)
    .select('id, full_name, avatar_url, role, job_title, created_at')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: true })

  if (error) throw error

  // Get emails from auth - we need to join with auth.users
  // For now, we'll return without emails (they can be added later with proper auth admin setup)
  return (data as OrganizationMember[]).map((member) => ({
    ...member,
    email: '', // Email would need admin API access
  }))
}

export async function updateMemberRole(memberId: string, role: 'admin' | 'manager' | 'sales_rep'): Promise<void> {
  const supabase = getSupabase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('profiles') as any)
    .update({ role })
    .eq('id', memberId)

  if (error) throw error
}

export async function removeMember(memberId: string): Promise<void> {
  const supabase = getSupabase()

  // Instead of deleting, we could set organization_id to null
  // For now, we'll just throw an error as this requires careful handling
  throw new Error('Remoção de membros requer confirmação do administrador')
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const supabase = getSupabase()

  // Verify current password by attempting to sign in
  const { data: user } = await supabase.auth.getUser()
  if (!user.user?.email) throw new Error('Usuário não autenticado')

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}
