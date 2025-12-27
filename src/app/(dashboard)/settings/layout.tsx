'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { User, Building2, Users, Shield } from 'lucide-react'

const settingsNav = [
  {
    title: 'Perfil',
    href: '/settings/profile',
    icon: User,
    description: 'Suas informações pessoais',
  },
  {
    title: 'Organização',
    href: '/settings/organization',
    icon: Building2,
    description: 'Dados da empresa',
  },
  {
    title: 'Usuários',
    href: '/settings/users',
    icon: Users,
    description: 'Gerenciar equipe',
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas configurações e preferências
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar */}
        <aside className="md:w-64 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'justify-start h-auto py-3',
                    isActive && 'bg-secondary'
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </Button>
              )
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
