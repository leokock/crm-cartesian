-- ============================================
-- TRIGGER PARA CRIAR WORKFLOW AO GANHAR DEAL
-- ============================================

CREATE OR REPLACE FUNCTION handle_deal_won()
RETURNS TRIGGER AS $$
DECLARE
  v_workflow_id UUID;
  v_template_id UUID;
  v_template_task RECORD;
  v_task_mapping JSONB := '{}';
  v_new_task_id UUID;
  v_depends_on_id UUID;
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
        -- Resolve dependência
        v_depends_on_id := NULL;
        IF v_template_task.depends_on_task_id IS NOT NULL THEN
          v_depends_on_id := (v_task_mapping->>v_template_task.depends_on_task_id::text)::uuid;
        END IF;

        INSERT INTO workflow_tasks (
          workflow_id, template_task_id, name, description, category,
          status, assignee_id, due_date, depends_on_task_id, display_order
        ) VALUES (
          v_workflow_id, v_template_task.id, v_template_task.name,
          v_template_task.description, v_template_task.category, 'pending',
          CASE
            WHEN v_template_task.default_assignee_role = 'deal_owner' THEN NEW.owner_id
            ELSE v_template_task.default_assignee_id
          END,
          CURRENT_DATE + v_template_task.due_days_offset,
          v_depends_on_id,
          v_template_task.display_order
        ) RETURNING id INTO v_new_task_id;

        -- Mapeia template_task_id -> new_task_id
        v_task_mapping := v_task_mapping || jsonb_build_object(v_template_task.id::text, v_new_task_id);
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

-- ============================================
-- NOTIFICAÇÃO QUANDO TAREFA É ATRIBUÍDA
-- ============================================

CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER AS $$
DECLARE
  v_workflow_id UUID;
BEGIN
  IF NEW.assignee_id IS NOT NULL AND (OLD.assignee_id IS NULL OR NEW.assignee_id != OLD.assignee_id) THEN
    SELECT workflow_id INTO v_workflow_id FROM workflow_tasks WHERE id = NEW.id;

    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.assignee_id,
      'task_assigned',
      'Nova tarefa atribuída',
      NEW.name,
      '/workflows/' || v_workflow_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_task_assigned
  AFTER INSERT OR UPDATE ON workflow_tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_assigned();

-- ============================================
-- SEED SOLUÇÕES PADRÃO
-- ============================================

CREATE OR REPLACE FUNCTION seed_default_solutions(org_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO solutions (organization_id, name, description, is_system, is_active) VALUES
    (org_id, 'Orçamento Paramétrico', 'Estimativa inicial baseada em parâmetros', true, true),
    (org_id, 'Orçamento Preliminar', 'Orçamento com nível médio de detalhamento', true, true),
    (org_id, 'Orçamento Executivo', 'Orçamento detalhado para execução', true, true),
    (org_id, 'Coordenação e Compatibilização BIM', 'Coordenação completa + compatibilização de modelos', true, true),
    (org_id, 'Compatibilização BIM', 'Apenas compatibilização de modelos BIM', true, true),
    (org_id, 'Planejamento Preliminar', 'Planejamento inicial da obra', true, true),
    (org_id, 'Planejamento Executivo', 'Planejamento detalhado para execução', true, true);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED PIPELINE PADRÃO
-- ============================================

CREATE OR REPLACE FUNCTION seed_default_pipeline(org_id UUID)
RETURNS UUID AS $$
DECLARE
  pipeline_id UUID;
BEGIN
  INSERT INTO pipelines (organization_id, name, is_default, is_active)
  VALUES (org_id, 'Pipeline Padrão', true, true)
  RETURNING id INTO pipeline_id;

  INSERT INTO pipeline_stages (pipeline_id, name, probability, display_order, color) VALUES
    (pipeline_id, 'Prospecção', 10, 1, '#64748b'),
    (pipeline_id, 'Qualificação', 25, 2, '#3b82f6'),
    (pipeline_id, 'Proposta', 50, 3, '#8b5cf6'),
    (pipeline_id, 'Negociação', 75, 4, '#f59e0b'),
    (pipeline_id, 'Fechamento', 90, 5, '#22c55e');

  RETURN pipeline_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO PARA CRIAR NOVA ORGANIZAÇÃO COM SEEDS
-- ============================================

CREATE OR REPLACE FUNCTION create_organization_with_seeds(
  org_name TEXT,
  org_slug TEXT,
  admin_user_id UUID,
  admin_email TEXT,
  admin_name TEXT
)
RETURNS UUID AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Criar organização
  INSERT INTO organizations (name, slug)
  VALUES (org_name, org_slug)
  RETURNING id INTO new_org_id;

  -- Criar perfil do admin
  INSERT INTO profiles (id, organization_id, email, full_name, role)
  VALUES (admin_user_id, new_org_id, admin_email, admin_name, 'admin');

  -- Seed soluções padrão
  PERFORM seed_default_solutions(new_org_id);

  -- Seed pipeline padrão
  PERFORM seed_default_pipeline(new_org_id);

  RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
