-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORGANIZATIONS
-- ============================================

CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id = auth.organization_id());

CREATE POLICY "Admins can update their organization"
  ON organizations FOR UPDATE
  USING (id = auth.organization_id() AND auth.user_role() = 'admin');

-- ============================================
-- PROFILES
-- ============================================

CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can update any profile in their organization"
  ON profiles FOR UPDATE
  USING (organization_id = auth.organization_id() AND auth.user_role() = 'admin');

CREATE POLICY "Admins can insert profiles in their organization"
  ON profiles FOR INSERT
  WITH CHECK (organization_id = auth.organization_id() AND auth.user_role() = 'admin');

-- ============================================
-- TEAMS
-- ============================================

CREATE POLICY "Users can view teams in their organization"
  ON teams FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Admins and managers can manage teams"
  ON teams FOR ALL
  USING (organization_id = auth.organization_id() AND auth.user_role() IN ('admin', 'manager'));

-- ============================================
-- TEAM MEMBERS
-- ============================================

CREATE POLICY "Users can view team members in their organization"
  ON team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM teams t WHERE t.id = team_id AND t.organization_id = auth.organization_id()
  ));

CREATE POLICY "Admins and managers can manage team members"
  ON team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM teams t WHERE t.id = team_id AND t.organization_id = auth.organization_id()
  ) AND auth.user_role() IN ('admin', 'manager'));

-- ============================================
-- SOLUTIONS
-- ============================================

CREATE POLICY "Users can view solutions in their organization"
  ON solutions FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Admins can manage solutions"
  ON solutions FOR ALL
  USING (organization_id = auth.organization_id() AND auth.user_role() = 'admin');

-- ============================================
-- COMPANIES
-- ============================================

CREATE POLICY "Users can view companies in their organization"
  ON companies FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Users can create companies in their organization"
  ON companies FOR INSERT
  WITH CHECK (organization_id = auth.organization_id());

CREATE POLICY "Users can update companies in their organization"
  ON companies FOR UPDATE
  USING (organization_id = auth.organization_id());

CREATE POLICY "Only admin/manager can delete companies"
  ON companies FOR DELETE
  USING (organization_id = auth.organization_id() AND auth.user_role() IN ('admin', 'manager'));

-- ============================================
-- CONTACTS
-- ============================================

CREATE POLICY "Users can view contacts in their organization"
  ON contacts FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Users can create contacts in their organization"
  ON contacts FOR INSERT
  WITH CHECK (organization_id = auth.organization_id());

CREATE POLICY "Users can update contacts in their organization"
  ON contacts FOR UPDATE
  USING (organization_id = auth.organization_id());

CREATE POLICY "Only admin/manager can delete contacts"
  ON contacts FOR DELETE
  USING (organization_id = auth.organization_id() AND auth.user_role() IN ('admin', 'manager'));

-- ============================================
-- PROJECTS
-- ============================================

CREATE POLICY "Users can view projects in their organization"
  ON projects FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Users can create projects in their organization"
  ON projects FOR INSERT
  WITH CHECK (organization_id = auth.organization_id());

CREATE POLICY "Users can update projects in their organization"
  ON projects FOR UPDATE
  USING (organization_id = auth.organization_id());

CREATE POLICY "Only admin/manager can delete projects"
  ON projects FOR DELETE
  USING (organization_id = auth.organization_id() AND auth.user_role() IN ('admin', 'manager'));

-- ============================================
-- PIPELINES
-- ============================================

CREATE POLICY "Users can view pipelines in their organization"
  ON pipelines FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Admins can manage pipelines"
  ON pipelines FOR ALL
  USING (organization_id = auth.organization_id() AND auth.user_role() = 'admin');

-- ============================================
-- PIPELINE STAGES
-- ============================================

CREATE POLICY "Users can view stages in their organization"
  ON pipeline_stages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM pipelines p WHERE p.id = pipeline_id AND p.organization_id = auth.organization_id()
  ));

CREATE POLICY "Admins can manage stages"
  ON pipeline_stages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM pipelines p WHERE p.id = pipeline_id AND p.organization_id = auth.organization_id()
  ) AND auth.user_role() = 'admin');

-- ============================================
-- DEALS
-- ============================================

CREATE POLICY "Users can view deals in their organization"
  ON deals FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Users can create deals in their organization"
  ON deals FOR INSERT
  WITH CHECK (organization_id = auth.organization_id());

CREATE POLICY "Users can update deals in their organization"
  ON deals FOR UPDATE
  USING (organization_id = auth.organization_id());

CREATE POLICY "Only admin/manager can delete deals"
  ON deals FOR DELETE
  USING (organization_id = auth.organization_id() AND auth.user_role() IN ('admin', 'manager'));

-- ============================================
-- DEAL SOLUTIONS
-- ============================================

CREATE POLICY "Users can view deal solutions in their organization"
  ON deal_solutions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM deals d WHERE d.id = deal_id AND d.organization_id = auth.organization_id()
  ));

CREATE POLICY "Users can manage deal solutions in their organization"
  ON deal_solutions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM deals d WHERE d.id = deal_id AND d.organization_id = auth.organization_id()
  ));

-- ============================================
-- DEAL CONTACTS
-- ============================================

CREATE POLICY "Users can view deal contacts in their organization"
  ON deal_contacts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM deals d WHERE d.id = deal_id AND d.organization_id = auth.organization_id()
  ));

CREATE POLICY "Users can manage deal contacts in their organization"
  ON deal_contacts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM deals d WHERE d.id = deal_id AND d.organization_id = auth.organization_id()
  ));

-- ============================================
-- ACTIVITIES
-- ============================================

CREATE POLICY "Users can view activities in their organization"
  ON activities FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Users can create activities in their organization"
  ON activities FOR INSERT
  WITH CHECK (organization_id = auth.organization_id());

CREATE POLICY "Users can update activities in their organization"
  ON activities FOR UPDATE
  USING (organization_id = auth.organization_id());

CREATE POLICY "Only admin/manager can delete activities"
  ON activities FOR DELETE
  USING (organization_id = auth.organization_id() AND auth.user_role() IN ('admin', 'manager'));

-- ============================================
-- WORKFLOW TEMPLATES
-- ============================================

CREATE POLICY "Users can view workflow templates in their organization"
  ON workflow_templates FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Admins can manage workflow templates"
  ON workflow_templates FOR ALL
  USING (organization_id = auth.organization_id() AND auth.user_role() = 'admin');

-- ============================================
-- WORKFLOW TEMPLATE TASKS
-- ============================================

CREATE POLICY "Users can view template tasks in their organization"
  ON workflow_template_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workflow_templates wt WHERE wt.id = template_id AND wt.organization_id = auth.organization_id()
  ));

CREATE POLICY "Admins can manage template tasks"
  ON workflow_template_tasks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM workflow_templates wt WHERE wt.id = template_id AND wt.organization_id = auth.organization_id()
  ) AND auth.user_role() = 'admin');

-- ============================================
-- WORKFLOWS
-- ============================================

CREATE POLICY "Users can view workflows in their organization"
  ON workflows FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Users can create workflows in their organization"
  ON workflows FOR INSERT
  WITH CHECK (organization_id = auth.organization_id());

CREATE POLICY "Users can update workflows in their organization"
  ON workflows FOR UPDATE
  USING (organization_id = auth.organization_id());

-- ============================================
-- WORKFLOW TASKS
-- ============================================

CREATE POLICY "Users can view workflow tasks in their organization"
  ON workflow_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workflows w WHERE w.id = workflow_id AND w.organization_id = auth.organization_id()
  ));

CREATE POLICY "Users can update workflow tasks in their organization"
  ON workflow_tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workflows w WHERE w.id = workflow_id AND w.organization_id = auth.organization_id()
  ));

CREATE POLICY "Users can insert workflow tasks in their organization"
  ON workflow_tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workflows w WHERE w.id = workflow_id AND w.organization_id = auth.organization_id()
  ));

-- ============================================
-- WORKFLOW TASK COMMENTS
-- ============================================

CREATE POLICY "Users can view task comments in their organization"
  ON workflow_task_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workflow_tasks wt
    JOIN workflows w ON w.id = wt.workflow_id
    WHERE wt.id = task_id AND w.organization_id = auth.organization_id()
  ));

CREATE POLICY "Users can create comments in their organization"
  ON workflow_task_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM workflow_tasks wt
      JOIN workflows w ON w.id = wt.workflow_id
      WHERE wt.id = task_id AND w.organization_id = auth.organization_id()
    )
  );

CREATE POLICY "Users can update own comments"
  ON workflow_task_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON workflow_task_comments FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE POLICY "Users can view audit logs in their organization"
  ON audit_logs FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (organization_id = auth.organization_id());
