'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/page-header'
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Building2,
} from 'lucide-react'

const tabs = [
  { value: '/reports', label: 'Visão Geral', icon: BarChart3 },
  { value: '/reports/sales', label: 'Vendas', icon: TrendingUp },
  { value: '/reports/pipeline', label: 'Pipeline', icon: BarChart3 },
  { value: '/reports/activities', label: 'Atividades', icon: Activity },
  { value: '/reports/team', label: 'Equipe', icon: Users },
  { value: '/reports/clients', label: 'Clientes', icon: Building2 },
]

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Análise detalhada de vendas, pipeline e performance"
      />

      <Tabs value={pathname} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger key={tab.value} value={tab.value} asChild>
                <Link href={tab.value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Link>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {children}
    </div>
  )
}
