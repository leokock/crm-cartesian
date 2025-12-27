import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: React.ReactNode
  }
  children?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  backHref,
  action,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        {backHref && (
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action && (
          action.href ? (
            <Button asChild>
              <Link href={action.href}>
                {action.icon || <Plus className="mr-2 h-4 w-4" />}
                {action.label}
              </Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>
              {action.icon || <Plus className="mr-2 h-4 w-4" />}
              {action.label}
            </Button>
          )
        )}
      </div>
    </div>
  )
}
