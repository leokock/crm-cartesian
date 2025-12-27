export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'manager' | 'sales_rep'
          is_active: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'sales_rep'
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'sales_rep'
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          is_leader: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          is_leader?: boolean
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          is_leader?: boolean
          joined_at?: string
        }
      }
      solutions: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          is_system: boolean
          is_active: boolean
          base_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          is_system?: boolean
          is_active?: boolean
          base_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          is_system?: boolean
          is_active?: boolean
          base_price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          organization_id: string
          name: string
          cnpj: string | null
          domain: string | null
          industry: string | null
          size: string | null
          website: string | null
          phone: string | null
          address: Json | null
          custom_fields: Json
          tags: string[]
          owner_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          cnpj?: string | null
          domain?: string | null
          industry?: string | null
          size?: string | null
          website?: string | null
          phone?: string | null
          address?: Json | null
          custom_fields?: Json
          tags?: string[]
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          cnpj?: string | null
          domain?: string | null
          industry?: string | null
          size?: string | null
          website?: string | null
          phone?: string | null
          address?: Json | null
          custom_fields?: Json
          tags?: string[]
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          organization_id: string
          company_id: string | null
          first_name: string
          last_name: string | null
          email: string | null
          phone: string | null
          mobile: string | null
          job_title: string | null
          department: string | null
          address: Json | null
          custom_fields: Json
          tags: string[]
          owner_id: string | null
          created_by: string | null
          source: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          company_id?: string | null
          first_name: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          mobile?: string | null
          job_title?: string | null
          department?: string | null
          address?: Json | null
          custom_fields?: Json
          tags?: string[]
          owner_id?: string | null
          created_by?: string | null
          source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          company_id?: string | null
          first_name?: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          mobile?: string | null
          job_title?: string | null
          department?: string | null
          address?: Json | null
          custom_fields?: Json
          tags?: string[]
          owner_id?: string | null
          created_by?: string | null
          source?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          company_id: string
          name: string
          description: string | null
          area_m2: number | null
          project_type: string | null
          location: string | null
          status: 'active' | 'completed' | 'cancelled'
          start_date: string | null
          expected_end_date: string | null
          custom_fields: Json
          owner_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          company_id: string
          name: string
          description?: string | null
          area_m2?: number | null
          project_type?: string | null
          location?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          start_date?: string | null
          expected_end_date?: string | null
          custom_fields?: Json
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          company_id?: string
          name?: string
          description?: string | null
          area_m2?: number | null
          project_type?: string | null
          location?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          start_date?: string | null
          expected_end_date?: string | null
          custom_fields?: Json
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pipelines: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          is_default: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pipeline_stages: {
        Row: {
          id: string
          organization_id: string
          name: string
          color: string
          position: number
          probability: number
          is_system: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          color?: string
          position?: number
          probability?: number
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          color?: string
          position?: number
          probability?: number
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          organization_id: string
          company_id: string
          project_id: string | null
          contact_id: string | null
          stage_id: string
          title: string
          description: string | null
          value: number | null
          currency: string
          status: 'open' | 'won' | 'lost'
          expected_close_date: string | null
          actual_close_date: string | null
          lost_reason: string | null
          owner_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          company_id: string
          project_id?: string | null
          contact_id?: string | null
          stage_id: string
          title: string
          description?: string | null
          value?: number | null
          currency?: string
          status?: 'open' | 'won' | 'lost'
          expected_close_date?: string | null
          actual_close_date?: string | null
          lost_reason?: string | null
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          company_id?: string
          project_id?: string | null
          contact_id?: string | null
          stage_id?: string
          title?: string
          description?: string | null
          value?: number | null
          currency?: string
          status?: 'open' | 'won' | 'lost'
          expected_close_date?: string | null
          actual_close_date?: string | null
          lost_reason?: string | null
          owner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deal_solutions: {
        Row: {
          id: string
          deal_id: string
          solution_id: string
          value: number | null
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          solution_id: string
          value?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          solution_id?: string
          value?: number | null
          created_at?: string
        }
      }
      deal_contacts: {
        Row: {
          id: string
          deal_id: string
          contact_id: string
          role: string | null
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          contact_id: string
          role?: string | null
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          contact_id?: string
          role?: string | null
          is_primary?: boolean
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          organization_id: string
          type: 'call' | 'meeting' | 'email' | 'task' | 'note' | 'visit'
          title: string
          description: string | null
          due_date: string | null
          completed_at: string | null
          is_completed: boolean
          company_id: string | null
          contact_id: string | null
          deal_id: string | null
          project_id: string | null
          owner_id: string | null
          created_by: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          type: 'call' | 'meeting' | 'email' | 'task' | 'note' | 'visit'
          title: string
          description?: string | null
          due_date?: string | null
          completed_at?: string | null
          is_completed?: boolean
          company_id?: string | null
          contact_id?: string | null
          deal_id?: string | null
          project_id?: string | null
          owner_id?: string | null
          created_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          type?: 'call' | 'meeting' | 'email' | 'task' | 'note' | 'visit'
          title?: string
          description?: string | null
          due_date?: string | null
          completed_at?: string | null
          is_completed?: boolean
          company_id?: string | null
          contact_id?: string | null
          deal_id?: string | null
          project_id?: string | null
          owner_id?: string | null
          created_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      workflow_templates: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          trigger_type: 'deal_won' | 'manual'
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          trigger_type: 'deal_won' | 'manual'
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          trigger_type?: 'deal_won' | 'manual'
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workflow_template_tasks: {
        Row: {
          id: string
          template_id: string
          name: string
          description: string | null
          category: 'contract' | 'onboarding' | 'implementation' | 'training' | 'delivery' | 'other' | null
          default_assignee_role: string | null
          default_assignee_id: string | null
          due_days_offset: number
          depends_on_task_id: string | null
          display_order: number
          is_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          name: string
          description?: string | null
          category?: 'contract' | 'onboarding' | 'implementation' | 'training' | 'delivery' | 'other' | null
          default_assignee_role?: string | null
          default_assignee_id?: string | null
          due_days_offset?: number
          depends_on_task_id?: string | null
          display_order: number
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          name?: string
          description?: string | null
          category?: 'contract' | 'onboarding' | 'implementation' | 'training' | 'delivery' | 'other' | null
          default_assignee_role?: string | null
          default_assignee_id?: string | null
          due_days_offset?: number
          depends_on_task_id?: string | null
          display_order?: number
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workflows: {
        Row: {
          id: string
          organization_id: string
          template_id: string | null
          deal_id: string
          name: string
          status: 'active' | 'completed' | 'cancelled' | 'on_hold'
          started_at: string
          completed_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          template_id?: string | null
          deal_id: string
          name: string
          status?: 'active' | 'completed' | 'cancelled' | 'on_hold'
          started_at?: string
          completed_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          template_id?: string | null
          deal_id?: string
          name?: string
          status?: 'active' | 'completed' | 'cancelled' | 'on_hold'
          started_at?: string
          completed_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workflow_tasks: {
        Row: {
          id: string
          workflow_id: string
          template_task_id: string | null
          name: string
          description: string | null
          category: 'contract' | 'onboarding' | 'implementation' | 'training' | 'delivery' | 'other' | null
          status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped'
          blocked_reason: string | null
          assignee_id: string | null
          due_date: string | null
          completed_at: string | null
          completed_by: string | null
          depends_on_task_id: string | null
          display_order: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workflow_id: string
          template_task_id?: string | null
          name: string
          description?: string | null
          category?: 'contract' | 'onboarding' | 'implementation' | 'training' | 'delivery' | 'other' | null
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped'
          blocked_reason?: string | null
          assignee_id?: string | null
          due_date?: string | null
          completed_at?: string | null
          completed_by?: string | null
          depends_on_task_id?: string | null
          display_order: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workflow_id?: string
          template_task_id?: string | null
          name?: string
          description?: string | null
          category?: 'contract' | 'onboarding' | 'implementation' | 'training' | 'delivery' | 'other' | null
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped'
          blocked_reason?: string | null
          assignee_id?: string | null
          due_date?: string | null
          completed_at?: string | null
          completed_by?: string | null
          depends_on_task_id?: string | null
          display_order?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workflow_task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          link: string | null
          is_read: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          link?: string | null
          is_read?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          link?: string | null
          is_read?: boolean
          metadata?: Json
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          entity_type: string
          entity_id: string
          action: 'create' | 'update' | 'delete' | 'stage_change' | 'status_change'
          old_values: Json | null
          new_values: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          entity_type: string
          entity_id: string
          action: 'create' | 'update' | 'delete' | 'stage_change' | 'status_change'
          old_values?: Json | null
          new_values?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          entity_type?: string
          entity_id?: string
          action?: 'create' | 'update' | 'delete' | 'stage_change' | 'status_change'
          old_values?: Json | null
          new_values?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_organization_with_seeds: {
        Args: {
          org_name: string
          org_slug: string
          admin_user_id: string
          admin_email: string
          admin_name: string
        }
        Returns: string
      }
      seed_default_solutions: {
        Args: {
          org_id: string
        }
        Returns: undefined
      }
      seed_default_pipeline: {
        Args: {
          org_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
