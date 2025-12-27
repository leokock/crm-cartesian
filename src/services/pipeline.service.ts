import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type PipelineStage = Database['public']['Tables']['pipeline_stages']['Row']
type PipelineStageInsert = Database['public']['Tables']['pipeline_stages']['Insert']
type PipelineStageUpdate = Database['public']['Tables']['pipeline_stages']['Update']

type TypedSupabaseClient = ReturnType<typeof createClient>

function getSupabase(): TypedSupabaseClient {
  return createClient()
}

export interface StageWithDealsCount extends PipelineStage {
  deals: { count: number }[]
}

export async function getPipelineStages(): Promise<PipelineStage[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .order('position')

  if (error) throw error
  return data as PipelineStage[]
}

export async function getPipelineStagesWithDealsCount(): Promise<StageWithDealsCount[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('pipeline_stages')
    .select(`
      *,
      deals:deals(count)
    `)
    .order('position')

  if (error) throw error
  return data as unknown as StageWithDealsCount[]
}

export async function getPipelineStage(id: string): Promise<PipelineStage> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as PipelineStage
}

export interface StageFormData {
  name: string
  color?: string
  probability?: number
}

export async function createPipelineStage(formData: StageFormData) {
  const supabase = getSupabase()
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .single()

  if (profileError || !profileData) throw new Error('Usuário não autenticado')
  const profile = profileData as { organization_id: string }

  // Get max position
  const { data: stages } = await supabase
    .from('pipeline_stages')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)

  const maxPosition = stages && stages.length > 0 ? (stages[0] as { position: number }).position : -1

  const insertData: PipelineStageInsert = {
    organization_id: profile.organization_id,
    name: formData.name,
    color: formData.color || '#6366f1',
    probability: formData.probability || 0,
    position: maxPosition + 1,
    is_system: false,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('pipeline_stages') as any)
    .insert(insertData)
    .select()
    .single()

  if (error) throw error
  return data as PipelineStage
}

export async function updatePipelineStage(id: string, formData: StageFormData) {
  const supabase = getSupabase()
  const updateData: PipelineStageUpdate = {
    name: formData.name,
    color: formData.color,
    probability: formData.probability,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('pipeline_stages') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as PipelineStage
}

export async function reorderPipelineStages(stageIds: string[]) {
  const supabase = getSupabase()

  // Update positions for each stage
  const updates = stageIds.map((id, index) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('pipeline_stages') as any)
      .update({ position: index })
      .eq('id', id)
  )

  await Promise.all(updates)
}

export async function deletePipelineStage(id: string) {
  const supabase = getSupabase()

  // Check if it's a system stage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stage } = await (supabase.from('pipeline_stages') as any)
    .select('is_system')
    .eq('id', id)
    .single()

  if ((stage as { is_system?: boolean })?.is_system) {
    throw new Error('Não é possível excluir estágios do sistema')
  }

  // Check if there are deals in this stage
  const { data: deals } = await supabase
    .from('deals')
    .select('id')
    .eq('stage_id', id)
    .limit(1)

  if (deals && deals.length > 0) {
    throw new Error('Não é possível excluir estágios com negócios. Mova os negócios primeiro.')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('pipeline_stages') as any)
    .delete()
    .eq('id', id)

  if (error) throw error
}
