export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Dashboard
  HOME: '/',
  DASHBOARD: '/',

  // Pipeline
  PIPELINE: '/pipeline',
  PIPELINE_VIEW: (id: string) => `/pipeline/${id}`,

  // Deals
  DEALS: '/deals',
  DEAL_NEW: '/deals/new',
  DEAL_DETAIL: (id: string) => `/deals/${id}`,

  // Clients
  CLIENTS: '/clients',
  CLIENT_NEW: '/clients/new',
  CLIENT_DETAIL: (id: string) => `/clients/${id}`,

  // Projects
  PROJECTS: '/projects',
  PROJECT_NEW: '/projects/new',
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,

  // Contacts
  CONTACTS: '/contacts',
  CONTACT_NEW: '/contacts/new',
  CONTACT_DETAIL: (id: string) => `/contacts/${id}`,

  // Solutions
  SOLUTIONS: '/solutions',

  // Workflows
  WORKFLOWS: '/workflows',
  WORKFLOW_DETAIL: (id: string) => `/workflows/${id}`,
  WORKFLOW_TEMPLATES: '/workflows/templates',
  WORKFLOW_TEMPLATE_DETAIL: (id: string) => `/workflows/templates/${id}`,

  // Activities
  ACTIVITIES: '/activities',

  // Reports
  REPORTS: '/reports',
  REPORTS_PIPELINE: '/reports/pipeline',
  REPORTS_SALES: '/reports/sales',

  // Settings
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_ORGANIZATION: '/settings/organization',
  SETTINGS_USERS: '/settings/users',
  SETTINGS_TEAMS: '/settings/teams',
  SETTINGS_PIPELINES: '/settings/pipelines',
} as const
