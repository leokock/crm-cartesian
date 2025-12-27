import { z } from 'zod'

// ============================================
// SOLUÇÕES
// ============================================

export const solutionSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  base_price: z.number().min(0, 'Preço não pode ser negativo').optional().nullable(),
  is_active: z.boolean().default(true).optional(),
})

export type SolutionFormData = z.infer<typeof solutionSchema>

// ============================================
// CLIENTES (COMPANIES)
// ============================================

export const companySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().optional(),
  domain: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string()).default([]).optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>

// ============================================
// PROJETOS
// ============================================

export const projectSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  company_id: z.string().uuid('Selecione um cliente'),
  description: z.string().optional(),
  area_m2: z.number().positive('Área deve ser positiva').optional().nullable(),
  project_type: z.enum(['residencial', 'comercial', 'industrial', 'misto', 'infraestrutura', 'outros']).optional(),
  location: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).default('active').optional(),
  start_date: z.string().optional(),
  expected_end_date: z.string().optional(),
})

export type ProjectFormData = z.infer<typeof projectSchema>

// ============================================
// CONTATOS
// ============================================

export const contactSchema = z.object({
  first_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  last_name: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  job_title: z.string().optional(),
  department: z.string().optional(),
  company_id: z.string().uuid().optional().nullable(),
  source: z.string().optional(),
  tags: z.array(z.string()).default([]).optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>

// ============================================
// DEALS
// ============================================

export const dealSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  project_id: z.string().uuid('Selecione um projeto'),
  pipeline_id: z.string().uuid('Selecione um pipeline'),
  stage_id: z.string().uuid('Selecione um estágio'),
  value: z.number().min(0, 'Valor não pode ser negativo').default(0).optional().nullable(),
  expected_close_date: z.string().optional(),
  probability: z.number().min(0).max(100).optional().nullable(),
  solution_ids: z.array(z.string().uuid()).default([]).optional(),
  contact_ids: z.array(z.string().uuid()).default([]).optional(),
  tags: z.array(z.string()).default([]).optional(),
})

export type DealFormData = z.infer<typeof dealSchema>

// ============================================
// ATIVIDADES
// ============================================

export const activitySchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note', 'task']),
  subject: z.string().min(1, 'Assunto é obrigatório'),
  description: z.string().optional(),
  outcome: z.string().optional(),
  duration_minutes: z.number().min(0).optional().nullable(),
  scheduled_at: z.string().optional(),
  deal_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  company_id: z.string().uuid().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
})

export type ActivityFormData = z.infer<typeof activitySchema>

// ============================================
// WORKFLOW TEMPLATES
// ============================================

export const workflowTemplateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  trigger_type: z.enum(['deal_won', 'manual']),
  is_active: z.boolean().default(true).optional(),
})

export type WorkflowTemplateFormData = z.infer<typeof workflowTemplateSchema>

export const workflowTemplateTaskSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  category: z.enum(['contract', 'onboarding', 'implementation', 'training', 'delivery', 'other']).optional(),
  default_assignee_role: z.enum(['deal_owner', 'manager', 'specific_user']).optional(),
  default_assignee_id: z.string().uuid().optional().nullable(),
  due_days_offset: z.number().min(0).default(0).optional().nullable(),
  is_required: z.boolean().default(true).optional(),
})

export type WorkflowTemplateTaskFormData = z.infer<typeof workflowTemplateTaskSchema>
