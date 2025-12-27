import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import type { SolutionFormData } from '@/lib/validations'

type Solution = Database['public']['Tables']['solutions']['Row']
type SolutionInsert = Database['public']['Tables']['solutions']['Insert']
type SolutionUpdate = Database['public']['Tables']['solutions']['Update']

type TypedSupabaseClient = ReturnType<typeof createClient>

function getSupabase(): TypedSupabaseClient {
  return createClient()
}

export async function getSolutions() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .order('is_system', { ascending: false })
    .order('name')

  if (error) throw error
  return data as Solution[]
}

export async function getSolution(id: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Solution
}

export async function createSolution(formData: SolutionFormData) {
  const supabase = getSupabase()
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .single()

  if (profileError || !profileData) throw new Error('Usuário não autenticado')
  const profile = profileData as { organization_id: string }

  const insertData: SolutionInsert = {
    organization_id: profile.organization_id,
    name: formData.name,
    description: formData.description || null,
    base_price: formData.base_price || null,
    is_active: formData.is_active,
    is_system: false,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('solutions') as any)
    .insert(insertData)
    .select()
    .single()

  if (error) throw error
  return data as Solution
}

export async function updateSolution(id: string, formData: SolutionFormData) {
  const supabase = getSupabase()
  const updateData: SolutionUpdate = {
    name: formData.name,
    description: formData.description || null,
    base_price: formData.base_price || null,
    is_active: formData.is_active,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('solutions') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Solution
}

export async function deleteSolution(id: string) {
  const supabase = getSupabase()
  // Verifica se é uma solução do sistema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: solution } = await (supabase.from('solutions') as any)
    .select('is_system')
    .eq('id', id)
    .single()

  if ((solution as { is_system?: boolean })?.is_system) {
    throw new Error('Não é possível excluir soluções do sistema')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('solutions') as any)
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function toggleSolutionActive(id: string, isActive: boolean) {
  const supabase = getSupabase()
  const updateData: SolutionUpdate = { is_active: isActive }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('solutions') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Solution
}
