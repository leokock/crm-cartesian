# Plano de Desenvolvimento - CRM Cartesian

> **Documento de Planejamento Técnico**
> Versão: 1.0
> Data: Dezembro 2025

---

## 1. Visão Geral do Projeto

### 1.1 Objetivo
Desenvolver um CRM completo inspirado no HubSpot e Pipedrive, com foco especial em:
- **Gestão de Pipeline de Vendas** com visualização Kanban
- **Estrutura hierárquica**: Cliente → Projetos → Negócios (Deals)
- **Fluxo administrativo pós-venda** automatizado
- **Catálogo de Soluções** específicas para o negócio

### 1.2 Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Frontend | Next.js 14 (App Router) | SSR, performance, DX moderna |
| Linguagem | TypeScript | Type safety, manutenibilidade |
| Database | Supabase (PostgreSQL) | Auth integrado, Realtime, RLS |
| UI Components | shadcn/ui + Tailwind CSS | Customizável, acessível |
| Drag & Drop | dnd-kit | Melhor para Kanban em React |
| State | Zustand + React Query | Simples e eficiente |
| Forms | react-hook-form + zod | Performance + validação tipada |
| Deploy | Vercel | Integração nativa Next.js |
| Idioma | Português (BR) | Mercado alvo |

### 1.3 Modelo de Usuários
- **Multi-usuário**: Uma empresa com múltiplos usuários e times
- **Roles disponíveis**:
  - `admin` - Acesso total, configurações
  - `manager` - Gestão de time, relatórios
  - `sales_rep` - Operacional, seus deals

---

## 2. Funcionalidades Principais

### 2.1 Soluções (Produtos/Serviços)
Cadastro de soluções oferecidas pela empresa.

**Soluções pré-cadastradas (seed):**
| # | Solução | Descrição |
|---|---------|-----------|
| 1 | Orçamento Paramétrico | Estimativa inicial baseada em parâmetros |
| 2 | Orçamento Preliminar | Orçamento com nível médio de detalhamento |
| 3 | Orçamento Executivo | Orçamento detalhado para execução |
| 4 | Coordenação e Compatibilização BIM | Coordenação completa + compatibilização |
| 5 | Compatibilização BIM | Apenas compatibilização de modelos BIM |
| 6 | Planejamento Preliminar | Planejamento inicial da obra |
| 7 | Planejamento Executivo | Planejamento detalhado para execução |

*Possibilidade de cadastrar outras soluções conforme necessidade.*

### 2.2 Clientes (Empresas)
- CRUD completo
- Campos customizáveis
- Tags e segmentação
- Timeline de atividades
- Visualização de projetos relacionados

### 2.3 Projetos
Cada cliente pode ter múltiplos projetos. Um deal é sempre vinculado a um projeto.

**Campos do Projeto:**
- Nome do projeto (obrigatório)
- Cliente (obrigatório)
- Descrição
- Área (m²)
- Tipo de obra (residencial, comercial, industrial, etc)
- Localização
- Status: `ativo`, `concluído`, `cancelado`
- Data início / previsão de término

**Exemplo de hierarquia:**
```
Cliente: Construtora ABC
  └── Projeto: Edifício Residencial Centro
        ├── Deal 1: Orçamento Paramétrico (R$ 15.000)
        ├── Deal 2: Compatibilização BIM (R$ 45.000)
        └── Deal 3: Planejamento Executivo (R$ 30.000)
  └── Projeto: Shopping Norte
        └── Deal 1: Orçamento Executivo (R$ 80.000)
```

### 2.4 Contatos
- CRUD completo
- Vinculado a um cliente (opcional)
- Associável a múltiplos deals
- Timeline de interações

### 2.5 Pipeline de Vendas (Kanban)
- Múltiplos funis customizáveis
- Estágios com probabilidade de fechamento (0-100%)
- Drag-and-drop de negócios entre estágios
- Visualização Kanban e Lista
- Atualização em tempo real (Supabase Realtime)

**Campos do Deal:**
- Título (obrigatório)
- Projeto (obrigatório)
- Soluções (múltiplas, N:N)
- Contatos associados
- Valor (R$)
- Probabilidade (%)
- Data prevista de fechamento
- Responsável (owner)
- Status: `open`, `won`, `lost`

### 2.6 Atividades
- **Tipos:** ligação, email, reunião, nota, tarefa
- Timeline integrada em contatos, clientes, projetos e deals
- Feed global de atividades
- Registro de outcome e duração

### 2.7 Fluxo Pós-Venda (CRÍTICO)
Quando um deal é marcado como **"Won"**, automaticamente cria um workflow de tarefas administrativas.

**Trigger automático:** `deals.status = 'won'`

**Templates de workflow** (criados pelo usuário, sem template padrão):
- Totalmente customizáveis
- Reutilizáveis para diferentes tipos de solução

**Categorias de tarefas sugeridas:**
- `contract` - Contratos (lançamento, assinatura, etc)
- `onboarding` - Onboarding do cliente (kick-off, coleta de docs, etc)
- `implementation` - Implantação
- `training` - Treinamento
- `delivery` - Entrega

**Funcionalidades do workflow:**
- Checklist interativo
- Status por tarefa: `pending`, `in_progress`, `completed`, `blocked`
- Assignees (responsáveis)
- Due dates (prazos)
- Dependências entre tarefas
- Comentários nas tarefas
- Barra de progresso visual
- Notificações

### 2.8 Usuários e Times
- Gestão de usuários com convites por email
- Times e líderes de time
- Permissões por role (RLS no Supabase)
- Audit log de ações

### 2.9 Relatórios
- Pipeline (deals por estágio, valores, conversão)
- Vendas (receita, tendências)
- Performance de time
- Progresso de workflows
- Visão por cliente/projeto
- Export CSV/PDF

---

## 3. Estrutura do Banco de Dados

### 3.1 Diagrama de Relacionamentos

```
┌──────────────────┐
│  organizations   │ (Tenant/Empresa)
└────────┬─────────┘
         │ 1:N
         ▼
┌──────────────────┐      1:N      ┌──────────────────┐
│     profiles     │◄─────────────►│      teams       │
│   (Usuários)     │               │     (Times)      │
└──────────────────┘               └──────────────────┘
         │
         │ owner_id
         ▼
┌──────────────────┐      1:N      ┌──────────────────┐
│    companies     │◄─────────────►│     projects     │
│   (Clientes)     │               │    (Projetos)    │
└──────────────────┘               └────────┬─────────┘
         │                                  │ 1:N
         │ company_id                       ▼
         ▼                         ┌──────────────────┐
┌──────────────────┐               │      deals       │
│     contacts     │◄─────────────►│    (Negócios)    │
│   (Contatos)     │  N:N          └────────┬─────────┘
└──────────────────┘                        │
                                           N:N
                                            ▼
                                   ┌──────────────────┐
                                   │    solutions     │
                                   │   (Soluções)     │
                                   └──────────────────┘

deals (quando won) ───► workflows ───► workflow_tasks
```

### 3.2 Schema SQL Completo

```sql
-- ============================================
-- ORGANIZAÇÃO E USUÁRIOS
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'sales_rep'
    CHECK (role IN ('admin', 'manager', 'sales_rep')),
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_leader BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- ============================================
-- SOLUÇÕES (Produtos/Serviços)
-- ============================================

CREATE TABLE solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,  -- true para as 7 pré-cadastradas
  is_active BOOLEAN DEFAULT TRUE,
  base_price DECIMAL(15, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTES E CONTATOS
-- ============================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  domain VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50),
  website TEXT,
  phone VARCHAR(50),
  address JSONB,  -- {street, city, state, zip, country}
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  job_title VARCHAR(100),
  department VARCHAR(100),
  address JSONB,
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  source VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJETOS
-- ============================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  area_m2 DECIMAL(12,2),
  project_type VARCHAR(100),  -- residencial, comercial, industrial, misto
  location TEXT,
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled')),
  start_date DATE,
  expected_end_date DATE,
  custom_fields JSONB DEFAULT '{}',
  owner_id UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PIPELINE DE VENDAS
-- ============================================

CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  display_order INTEGER NOT NULL,
  color VARCHAR(20),
  is_won BOOLEAN DEFAULT FALSE,
  is_lost BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id),
  stage_id UUID NOT NULL REFERENCES pipeline_stages(id),
  project_id UUID NOT NULL REFERENCES projects(id),  -- Vinculado a projeto
  title VARCHAR(255) NOT NULL,
  value DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  expected_close_date DATE,
  actual_close_date DATE,
  probability INTEGER,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  lost_reason TEXT,
  owner_id UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Associação Deal ↔ Soluções (N:N)
CREATE TABLE deal_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  value DECIMAL(15, 2),  -- Valor específico dessa solução no deal
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deal_id, solution_id)
);

-- Associação Deal ↔ Contatos (N:N)
CREATE TABLE deal_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  role VARCHAR(100),  -- decision_maker, influencer, user, etc
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deal_id, contact_id)
);

-- ============================================
-- ATIVIDADES
-- ============================================

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL
    CHECK (type IN ('call', 'email', 'meeting', 'note', 'task', 'system')),
  subject VARCHAR(255),
  description TEXT,
  outcome VARCHAR(100),
  duration_minutes INTEGER,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  -- Associações polimórficas
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKFLOWS PÓS-VENDA
-- ============================================

CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('deal_won', 'manual')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_template_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100)
    CHECK (category IN ('contract', 'onboarding', 'implementation', 'training', 'delivery', 'other')),
  default_assignee_role VARCHAR(50),  -- 'deal_owner', 'manager', 'specific_user'
  default_assignee_id UUID REFERENCES profiles(id),
  due_days_offset INTEGER DEFAULT 0,  -- dias após criação do workflow
  depends_on_task_id UUID REFERENCES workflow_template_tasks(id),
  display_order INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES workflow_templates(id) ON DELETE SET NULL,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  template_task_id UUID REFERENCES workflow_template_tasks(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100)
    CHECK (category IN ('contract', 'onboarding', 'implementation', 'training', 'delivery', 'other')),
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'skipped')),
  blocked_reason TEXT,
  assignee_id UUID REFERENCES profiles(id),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  depends_on_task_id UUID REFERENCES workflow_tasks(id),
  display_order INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICAÇÕES E AUDIT
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL
    CHECK (action IN ('create', 'update', 'delete', 'stage_change', 'status_change')),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_companies_org ON companies(organization_id);
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_deals_org ON deals(organization_id);
CREATE INDEX idx_deals_project ON deals(project_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_workflows_deal ON workflows(deal_id);
CREATE INDEX idx_workflow_tasks_workflow ON workflow_tasks(workflow_id);
CREATE INDEX idx_workflow_tasks_assignee ON workflow_tasks(assignee_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

### 3.3 Seed - Soluções Pré-cadastradas

```sql
-- Executar após criar a organização
INSERT INTO solutions (organization_id, name, description, is_system, is_active) VALUES
  (:org_id, 'Orçamento Paramétrico', 'Estimativa inicial baseada em parâmetros', true, true),
  (:org_id, 'Orçamento Preliminar', 'Orçamento com nível médio de detalhamento', true, true),
  (:org_id, 'Orçamento Executivo', 'Orçamento detalhado para execução', true, true),
  (:org_id, 'Coordenação e Compatibilização BIM', 'Coordenação completa + compatibilização de modelos', true, true),
  (:org_id, 'Compatibilização BIM', 'Apenas compatibilização de modelos BIM', true, true),
  (:org_id, 'Planejamento Preliminar', 'Planejamento inicial da obra', true, true),
  (:org_id, 'Planejamento Executivo', 'Planejamento detalhado para execução', true, true);
```

### 3.4 Trigger - Criar Workflow ao Ganhar Deal

```sql
CREATE OR REPLACE FUNCTION handle_deal_won()
RETURNS TRIGGER AS $$
DECLARE
  v_workflow_id UUID;
  v_template_id UUID;
  v_template_task RECORD;
  v_new_task_id UUID;
BEGIN
  -- Só dispara quando status muda para 'won'
  IF NEW.status = 'won' AND (OLD.status IS NULL OR OLD.status != 'won') THEN

    -- Busca template ativo para deal_won
    SELECT id INTO v_template_id
    FROM workflow_templates
    WHERE organization_id = NEW.organization_id
      AND trigger_type = 'deal_won'
      AND is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_template_id IS NOT NULL THEN
      -- Cria instância do workflow
      INSERT INTO workflows (
        organization_id, template_id, deal_id, name, status, created_by
      ) VALUES (
        NEW.organization_id, v_template_id, NEW.id,
        'Pós-Venda: ' || NEW.title, 'active', NEW.owner_id
      ) RETURNING id INTO v_workflow_id;

      -- Cria tarefas a partir do template
      FOR v_template_task IN
        SELECT * FROM workflow_template_tasks
        WHERE template_id = v_template_id
        ORDER BY display_order
      LOOP
        INSERT INTO workflow_tasks (
          workflow_id, template_task_id, name, description, category,
          status, assignee_id, due_date, display_order
        ) VALUES (
          v_workflow_id, v_template_task.id, v_template_task.name,
          v_template_task.description, v_template_task.category, 'pending',
          CASE
            WHEN v_template_task.default_assignee_role = 'deal_owner' THEN NEW.owner_id
            ELSE v_template_task.default_assignee_id
          END,
          CURRENT_DATE + v_template_task.due_days_offset,
          v_template_task.display_order
        );
      END LOOP;
    END IF;

    -- Atualiza data de fechamento
    NEW.actual_close_date := CURRENT_DATE;
    NEW.closed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_deal_won
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION handle_deal_won();
```

---

## 4. Estrutura de Pastas (Next.js App Router)

```
crm-cartesian/
├── .env.local                      # Variáveis de ambiente
├── .env.example                    # Template de variáveis
├── next.config.js                  # Configuração Next.js
├── package.json                    # Dependências
├── tsconfig.json                   # TypeScript
├── tailwind.config.ts              # Tailwind CSS
├── middleware.ts                   # Middleware de autenticação
│
├── public/                         # Assets estáticos
│   ├── images/
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Grupo de autenticação (sem layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/            # Grupo principal (com layout)
│   │   │   ├── layout.tsx          # Layout com sidebar
│   │   │   ├── page.tsx            # Dashboard home
│   │   │   │
│   │   │   ├── pipeline/           # Kanban board
│   │   │   │   ├── page.tsx
│   │   │   │   └── [pipelineId]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── deals/              # Negócios
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [dealId]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── clients/            # Clientes (empresas)
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [clientId]/
│   │   │   │       └── page.tsx    # Mostra projetos do cliente
│   │   │   │
│   │   │   ├── projects/           # Projetos
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [projectId]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── contacts/           # Contatos
│   │   │   │   ├── page.tsx
│   │   │   │   └── [contactId]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── solutions/          # Soluções/Serviços
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── workflows/          # Workflows pós-venda
│   │   │   │   ├── page.tsx        # Lista de workflows ativos
│   │   │   │   ├── templates/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [templateId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── [workflowId]/
│   │   │   │       └── page.tsx    # Checklist view
│   │   │   │
│   │   │   ├── activities/         # Feed de atividades
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── reports/            # Relatórios
│   │   │   │   ├── page.tsx
│   │   │   │   ├── pipeline/page.tsx
│   │   │   │   └── sales/page.tsx
│   │   │   │
│   │   │   └── settings/           # Configurações
│   │   │       ├── page.tsx
│   │   │       ├── profile/page.tsx
│   │   │       ├── organization/page.tsx
│   │   │       ├── users/page.tsx
│   │   │       ├── teams/page.tsx
│   │   │       └── pipelines/page.tsx
│   │   │
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/callback/route.ts
│   │   │   └── webhooks/
│   │   │       └── supabase/route.ts
│   │   │
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Estilos globais
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui (button, card, dialog, etc)
│   │   ├── layout/                 # Sidebar, Header, Nav
│   │   ├── pipeline/               # KanbanBoard, DealCard, StageColumn
│   │   ├── workflows/              # WorkflowChecklist, TaskItem, ProgressBar
│   │   ├── deals/                  # DealForm, DealCard
│   │   ├── clients/                # ClientForm, ClientCard
│   │   ├── projects/               # ProjectForm, ProjectCard
│   │   ├── solutions/              # SolutionForm, SolutionPicker
│   │   ├── contacts/               # ContactForm, ContactPicker
│   │   ├── activities/             # ActivityTimeline, ActivityForm
│   │   ├── shared/                 # DataTable, SearchInput, TagInput
│   │   └── providers/              # AuthProvider, QueryProvider
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser client
│   │   │   ├── server.ts           # Server client
│   │   │   └── middleware.ts       # Middleware client
│   │   ├── utils/
│   │   │   ├── format.ts           # Formatação (moeda, data)
│   │   │   ├── validation.ts       # Schemas Zod
│   │   │   └── cn.ts               # classNames utility
│   │   └── constants/
│   │       └── routes.ts           # Constantes de rotas
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-deals.ts
│   │   ├── use-clients.ts
│   │   ├── use-projects.ts
│   │   ├── use-workflows.ts
│   │   └── use-realtime.ts
│   │
│   ├── services/                   # Camada de dados
│   │   ├── deals.service.ts
│   │   ├── clients.service.ts
│   │   ├── projects.service.ts
│   │   ├── workflows.service.ts
│   │   └── activities.service.ts
│   │
│   ├── types/                      # TypeScript types
│   │   ├── database.types.ts       # Gerado pelo Supabase
│   │   ├── deal.types.ts
│   │   ├── client.types.ts
│   │   ├── project.types.ts
│   │   └── workflow.types.ts
│   │
│   └── store/                      # Zustand stores
│       ├── use-pipeline-store.ts
│       └── use-ui-store.ts
│
└── supabase/
    ├── config.toml
    ├── migrations/
    │   ├── 00001_initial_schema.sql
    │   ├── 00002_rls_policies.sql
    │   └── 00003_functions_triggers.sql
    └── seed.sql                    # Seed com soluções padrão
```

---

## 5. Dependências do Projeto

### 5.1 package.json

```json
{
  "name": "crm-cartesian",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "supabase gen types typescript --local > src/types/database.types.ts"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",

    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.4.0",

    "@radix-ui/react-alert-dialog": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-popover": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "@radix-ui/react-tooltip": "^1.1.0",

    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.0",

    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.4.0",
    "zod": "^3.23.0",

    "@tanstack/react-query": "^5.40.0",
    "@tanstack/react-table": "^8.17.0",

    "zustand": "^4.5.0",
    "date-fns": "^3.6.0",
    "recharts": "^2.12.0",

    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "lucide-react": "^0.378.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.2.0",
    "supabase": "^1.169.0"
  }
}
```

### 5.2 Resumo das Bibliotecas

| Biblioteca | Uso |
|------------|-----|
| `@supabase/supabase-js` + `@supabase/ssr` | Database, Auth, Realtime |
| `@dnd-kit/*` | Drag-and-drop para Kanban |
| `@tanstack/react-query` | Data fetching, caching, mutations |
| `@tanstack/react-table` | Data tables com ordenação/filtros |
| `react-hook-form` + `zod` | Forms performáticos + validação tipada |
| `zustand` | State management (UI state) |
| `recharts` | Gráficos para relatórios |
| `date-fns` | Manipulação de datas |
| `lucide-react` | Ícones |
| `@radix-ui/*` | Componentes base do shadcn/ui |

---

## 6. Fases de Implementação

### Fase 1: Fundação
**Objetivo:** Setup do projeto e autenticação básica

- [ ] Criar projeto Next.js com TypeScript e Tailwind
- [ ] Configurar projeto Supabase
- [ ] Criar schema inicial (organizations, profiles, teams)
- [ ] Implementar autenticação (login, register, logout)
- [ ] Criar layout base (sidebar, header, navigation)
- [ ] Configurar shadcn/ui

**Entregáveis:**
- Usuário pode fazer login/logout
- Layout básico funcionando

---

### Fase 2: Soluções, Clientes, Projetos & Contatos
**Objetivo:** Cadastros base do sistema

- [ ] Criar tabelas (solutions, companies, projects, contacts)
- [ ] CRUD de soluções (com seed das 7 soluções padrão)
- [ ] CRUD de clientes (empresas)
- [ ] CRUD de projetos (vinculados a cliente)
- [ ] CRUD de contatos
- [ ] Implementar DataTable com filtros e busca
- [ ] Página de detalhe do cliente mostrando projetos

**Entregáveis:**
- Todas as telas de cadastro funcionando
- Soluções pré-cadastradas visíveis

---

### Fase 3: Pipeline de Vendas
**Objetivo:** Kanban board e gestão de deals

- [ ] Criar tabelas (pipelines, stages, deals, deal_solutions, deal_contacts)
- [ ] Interface de gestão de pipelines/estágios
- [ ] Kanban board com dnd-kit
- [ ] Deal cards com drag-and-drop entre estágios
- [ ] Formulário de deal (associar projeto, soluções, contatos)
- [ ] Seleção múltipla de soluções por deal
- [ ] Integrar Supabase Realtime para atualizações em tempo real

**Entregáveis:**
- Kanban board funcionando com drag-and-drop
- Deals vinculados a projetos e soluções

---

### Fase 4: Atividades
**Objetivo:** Registro de interações

- [ ] Criar tabela activities
- [ ] Formulário para registrar atividades (call, email, meeting, note)
- [ ] Componente Timeline reutilizável
- [ ] Integrar timeline em: deals, contatos, clientes, projetos
- [ ] Feed global de atividades

**Entregáveis:**
- Timeline visível em todas as entidades
- Feed global funcionando

---

### Fase 5: Workflows Pós-Venda (CRÍTICO)
**Objetivo:** Fluxo administrativo automático

- [ ] Criar tabelas (workflow_templates, workflow_template_tasks, workflows, workflow_tasks)
- [ ] Implementar trigger PostgreSQL para criar workflow ao marcar deal como "won"
- [ ] Interface de gestão de templates
- [ ] Builder de templates com tarefas ordenáveis
- [ ] Tela de checklist interativo de tarefas
- [ ] Funcionalidades: status, assignees, due dates, dependências
- [ ] Comentários nas tarefas
- [ ] Barra de progresso visual
- [ ] Notificações para assignees

**Entregáveis:**
- Ao ganhar um deal, workflow é criado automaticamente
- Checklist funcional com todas as features

---

### Fase 6: Usuários & Permissões
**Objetivo:** Multi-usuário com controle de acesso

- [ ] Interface de gestão de times
- [ ] Fluxo de convite de usuários por email
- [ ] Implementar Row Level Security (RLS) por organização
- [ ] Permissões por role (admin, manager, sales_rep)
- [ ] Audit logging para ações importantes

**Entregáveis:**
- Usuários podem convidar outros
- Dados isolados por organização

---

### Fase 7: Relatórios
**Objetivo:** Visibilidade e métricas

- [ ] Dashboard com métricas principais (KPIs)
- [ ] Relatório de pipeline (deals por estágio, valores, conversão)
- [ ] Relatório de vendas (receita, tendências)
- [ ] Relatório de performance de time
- [ ] Relatório de progresso de workflows
- [ ] Export para CSV/PDF

**Entregáveis:**
- Dashboard informativo
- Relatórios exportáveis

---

### Fase 8: Polimento
**Objetivo:** Qualidade e UX

- [ ] Otimizações de performance (lazy loading, memoization)
- [ ] Loading states e skeletons em todas as telas
- [ ] Error handling e error boundaries
- [ ] Responsividade mobile
- [ ] Acessibilidade (a11y)
- [ ] Testes E2E com Playwright

**Entregáveis:**
- Aplicação pronta para produção

---

## 7. Arquivos Críticos

| Arquivo | Descrição |
|---------|-----------|
| `supabase/migrations/00001_initial_schema.sql` | Schema completo do banco |
| `supabase/migrations/00003_functions_triggers.sql` | Trigger para criar workflow |
| `supabase/seed.sql` | Seed com as 7 soluções padrão |
| `src/components/pipeline/kanban-board.tsx` | Componente Kanban principal |
| `src/components/workflows/workflow-checklist.tsx` | Checklist pós-venda |
| `middleware.ts` | Proteção de rotas e auth |
| `src/lib/supabase/server.ts` | Cliente Supabase server-side |

---

## 8. Fluxo Principal do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUXO DO CRM                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CADASTROS BASE                                          │
│     └─► Cadastrar Soluções (já vem 7 pré-cadastradas)       │
│     └─► Cadastrar Clientes (empresas)                       │
│     └─► Cadastrar Projetos (vinculados a cliente)           │
│     └─► Cadastrar Contatos                                  │
│                                                             │
│  2. PROSPECÇÃO                                              │
│     └─► Identificar oportunidade em um Projeto              │
│                                                             │
│  3. QUALIFICAÇÃO                                            │
│     └─► Criar Deal no Pipeline                              │
│         └─► Vincular a um Projeto                           │
│         └─► Selecionar Solução(ões) a vender                │
│         └─► Associar Contatos do cliente                    │
│                                                             │
│  4. NEGOCIAÇÃO                                              │
│     └─► Mover Deal entre estágios (Kanban)                  │
│     └─► Registrar Atividades                                │
│                                                             │
│  5. FECHAMENTO                                              │
│     └─► Marcar Deal como "Won"                              │
│         │                                                   │
│         ▼  [TRIGGER AUTOMÁTICO]                             │
│  ┌──────────────────────────────────────────┐              │
│  │  6. WORKFLOW PÓS-VENDA                   │              │
│  │     └─► Workflow criado automaticamente  │              │
│  │     └─► Tarefas por categoria:           │              │
│  │         [CONTRATO]                       │              │
│  │         • Lançamento do contrato         │              │
│  │         • Assinatura                     │              │
│  │         [ONBOARDING]                     │              │
│  │         • Reunião de kick-off            │              │
│  │         • Coleta de documentos           │              │
│  │         • Treinamento                    │              │
│  │         • Entrega final                  │              │
│  │     └─► Checklist com progresso          │              │
│  └──────────────────────────────────────────┘              │
│                                                             │
│  7. ACOMPANHAMENTO                                          │
│     └─► Relatórios e métricas                               │
│     └─► Visão por Cliente/Projeto                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.1 Hierarquia de Dados

```
┌──────────────┐
│    Cliente   │
│  (company)   │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐
│   Projeto    │
│  (project)   │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐      N:N      ┌──────────────┐
│    Deal      │◄─────────────►│   Solução    │
│   (deal)     │               │  (solution)  │
└──────┬───────┘               └──────────────┘
       │ 1:1 (quando won)
       ▼
┌──────────────┐
│  Workflow    │
│   (tasks)    │
└──────────────┘
```

---

## 9. Variáveis de Ambiente

### .env.local (exemplo)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Próximos Passos

Após aprovar este plano:

1. **Criar projeto Supabase** em supabase.com
2. **Inicializar projeto Next.js** com `npx create-next-app@latest`
3. **Executar migrations** do schema SQL
4. **Configurar shadcn/ui** com `npx shadcn-ui@latest init`
5. **Implementar autenticação** (Fase 1)
6. **Seguir as fases** na ordem definida

---

## 11. Referências

- [HubSpot Pipeline Management](https://www.hubspot.com/products/crm/pipeline-management)
- [Pipedrive Workflow Automation](https://www.pipedrive.com/en/features/workflow-automation)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [dnd-kit Documentation](https://dndkit.com)

---

> **Documento gerado em:** Dezembro 2025
> **Versão:** 1.0
> **Status:** Aguardando aprovação para implementação

