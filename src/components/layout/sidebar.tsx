'use client'

import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'
import {
  BarChart3,
  Building2,
  CheckSquare,
  ClipboardList,
  FolderKanban,
  Home,
  LayoutGrid,
  Settings,
  Users,
  Workflow,
  Package,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const navigation = [
  {
    name: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    name: 'Pipeline',
    href: ROUTES.PIPELINE,
    icon: LayoutGrid,
  },
  {
    name: 'Negócios',
    href: ROUTES.DEALS,
    icon: FolderKanban,
  },
  {
    name: 'Clientes',
    href: ROUTES.CLIENTS,
    icon: Building2,
  },
  {
    name: 'Projetos',
    href: ROUTES.PROJECTS,
    icon: ClipboardList,
  },
  {
    name: 'Contatos',
    href: ROUTES.CONTACTS,
    icon: Users,
  },
  {
    name: 'Soluções',
    href: ROUTES.SOLUTIONS,
    icon: Package,
  },
  {
    name: 'Workflows',
    href: ROUTES.WORKFLOWS,
    icon: Workflow,
  },
  {
    name: 'Atividades',
    href: ROUTES.ACTIVITIES,
    icon: CheckSquare,
  },
  {
    name: 'Relatórios',
    href: ROUTES.REPORTS,
    icon: BarChart3,
  },
]

const bottomNavigation = [
  {
    name: 'Configurações',
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            C
          </div>
          <span className="text-lg font-semibold">CRM Cartesian</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const active = isActive(item.href)
            return (
              <Button
                key={item.name}
                variant={active ? 'secondary' : 'ghost'}
                className={cn(
                  'justify-start gap-3',
                  active && 'bg-secondary'
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Bottom navigation */}
      <div className="border-t px-3 py-4">
        <nav className="flex flex-col gap-1">
          {bottomNavigation.map((item) => {
            const active = isActive(item.href)
            return (
              <Button
                key={item.name}
                variant={active ? 'secondary' : 'ghost'}
                className={cn('justify-start gap-3', active && 'bg-secondary')}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
