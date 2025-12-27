import { createClient } from '@/lib/supabase/client'

type TypedSupabaseClient = ReturnType<typeof createClient>

function getSupabase(): TypedSupabaseClient {
  return createClient()
}

export type TriggerType = 'deal_stage_changed' | 'deal_created' | 'activity_completed' | 'manual'
export type ActionType = 'create_activity' | 'send_notification' | 'update_deal' | 'wait'
export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled'
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export interface WorkflowTemplate {
  id: string
  organization_id: string
  name: string
  description: string | null
  trigger_type: TriggerType
  trigger_config: Record<string, unknown>
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface WorkflowStep {
  id: string
  workflow_id: string
  step_order: number
  action_type: ActionType
  action_config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface WorkflowWithSteps extends WorkflowTemplate {
  steps: WorkflowStep[]
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  triggered_by: string | null
  trigger_data: Record<string, unknown>
  status: ExecutionStatus
  started_at: string
  completed_at: string | null
  error_message: string | null
  workflow?: { id: string; name: string }
}

export interface WorkflowFormData {
  name: string
  description?: string
  trigger_type: TriggerType
  trigger_config?: Record<string, unknown>
  is_active?: boolean
}

export interface WorkflowStepFormData {
  action_type: ActionType
  action_config?: Record<string, unknown>
}

export const TRIGGER_TYPES: { value: TriggerType; label: string; description: string }[] = [
  { value: 'deal_stage_changed', label: 'Negócio mudou de estágio', description: 'Executa quando um negócio muda de estágio no pipeline' },
  { value: 'deal_created', label: 'Negócio criado', description: 'Executa quando um novo negócio é criado' },
  { value: 'activity_completed', label: 'Atividade concluída', description: 'Executa quando uma atividade é marcada como concluída' },
  { value: 'manual', label: 'Manual', description: 'Executa apenas quando iniciado manualmente' },
]

export const ACTION_TYPES: { value: ActionType; label: string; description: string }[] = [
  { value: 'create_activity', label: 'Criar atividade', description: 'Cria uma nova atividade automaticamente' },
  { value: 'send_notification', label: 'Enviar notificação', description: 'Envia uma notificação para usuários' },
  { value: 'update_deal', label: 'Atualizar negócio', description: 'Atualiza campos do negócio' },
  { value: 'wait', label: 'Aguardar', description: 'Aguarda um período antes de continuar' },
]

export async function getWorkflows(): Promise<WorkflowTemplate[]> {
  const supabase = getSupabase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('workflow_templates') as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as WorkflowTemplate[]
}

export async function getWorkflow(id: string): Promise<WorkflowWithSteps> {
  const supabase = getSupabase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: workflow, error: workflowError } = await (supabase.from('workflow_templates') as any)
    .select('*')
    .eq('id', id)
    .single()

  if (workflowError) throw workflowError

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: steps, error: stepsError } = await (supabase.from('workflow_steps') as any)
    .select('*')
    .eq('workflow_id', id)
    .order('step_order', { ascending: true })

  if (stepsError) throw stepsError

  return {
    ...workflow,
    steps: steps || [],
  } as WorkflowWithSteps
}

export async function createWorkflow(formData: WorkflowFormData): Promise<WorkflowTemplate> {
  const supabase = getSupabase()
  const { data: user } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('organization_id')
    .single()

  if (!profile?.organization_id || !user.user) throw new Error('Usuário não autenticado')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('workflow_templates') as any)
    .insert({
      organization_id: profile.organization_id,
      name: formData.name,
      description: formData.description || null,
      trigger_type: formData.trigger_type,
      trigger_config: formData.trigger_config || {},
      is_active: formData.is_active ?? true,
      created_by: user.user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data as WorkflowTemplate
}

export async function updateWorkflow(id: string, formData: Partial<WorkflowFormData>): Promise<WorkflowTemplate> {
  const supabase = getSupabase()

  const updateData: Record<string, unknown> = {}
  if (formData.name !== undefined) updateData.name = formData.name
  if (formData.description !== undefined) updateData.description = formData.description
  if (formData.trigger_type !== undefined) updateData.trigger_type = formData.trigger_type
  if (formData.trigger_config !== undefined) updateData.trigger_config = formData.trigger_config
  if (formData.is_active !== undefined) updateData.is_active = formData.is_active

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('workflow_templates') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as WorkflowTemplate
}

export async function toggleWorkflowActive(id: string, isActive: boolean): Promise<WorkflowTemplate> {
  const supabase = getSupabase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('workflow_templates') as any)
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as WorkflowTemplate
}

export async function deleteWorkflow(id: string): Promise<void> {
  const supabase = getSupabase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('workflow_templates') as any)
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Workflow Steps
export async function addWorkflowStep(workflowId: string, stepData: WorkflowStepFormData): Promise<WorkflowStep> {
  const supabase = getSupabase()

  // Get current max step_order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingSteps } = await (supabase.from('workflow_steps') as any)
    .select('step_order')
    .eq('workflow_id', workflowId)
    .order('step_order', { ascending: false })
    .limit(1)

  const maxOrder = existingSteps?.[0]?.step_order || 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('workflow_steps') as any)
    .insert({
      workflow_id: workflowId,
      step_order: maxOrder + 1,
      action_type: stepData.action_type,
      action_config: stepData.action_config || {},
    })
    .select()
    .single()

  if (error) throw error
  return data as WorkflowStep
}

export async function updateWorkflowStep(stepId: string, stepData: Partial<WorkflowStepFormData>): Promise<WorkflowStep> {
  const supabase = getSupabase()

  const updateData: Record<string, unknown> = {}
  if (stepData.action_type !== undefined) updateData.action_type = stepData.action_type
  if (stepData.action_config !== undefined) updateData.action_config = stepData.action_config

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('workflow_steps') as any)
    .update(updateData)
    .eq('id', stepId)
    .select()
    .single()

  if (error) throw error
  return data as WorkflowStep
}

export async function deleteWorkflowStep(stepId: string): Promise<void> {
  const supabase = getSupabase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('workflow_steps') as any)
    .delete()
    .eq('id', stepId)

  if (error) throw error
}

export async function reorderWorkflowSteps(workflowId: string, stepIds: string[]): Promise<void> {
  const supabase = getSupabase()

  // Update each step's order
  for (let i = 0; i < stepIds.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('workflow_steps') as any)
      .update({ step_order: i + 1 })
      .eq('id', stepIds[i])
  }
}

// Workflow Executions
export async function getWorkflowExecutions(workflowId?: string, limit = 50): Promise<WorkflowExecution[]> {
  const supabase = getSupabase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('workflow_executions') as any)
    .select(`
      *,
      workflow:workflow_templates(id, name)
    `)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (workflowId) {
    query = query.eq('workflow_id', workflowId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as WorkflowExecution[]
}

export async function executeWorkflow(workflowId: string, triggerData?: Record<string, unknown>): Promise<WorkflowExecution> {
  const supabase = getSupabase()
  const { data: user } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('workflow_executions') as any)
    .insert({
      workflow_id: workflowId,
      triggered_by: user.user?.id,
      trigger_data: triggerData || {},
      status: 'running',
    })
    .select()
    .single()

  if (error) throw error

  // In a real implementation, this would trigger the actual workflow execution
  // For now, we'll just mark it as completed after a delay
  // This would typically be handled by a backend service or edge function

  return data as WorkflowExecution
}
