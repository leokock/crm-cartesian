'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { type DealsByPeriod } from '@/services/reports.service'

interface SalesChartProps {
  data: DealsByPeriod[] | undefined
  isLoading: boolean
  title?: string
  description?: string
}

export function SalesChart({
  data,
  isLoading,
  title = 'Negócios por Período',
  description = 'Quantidade de negócios ganhos, perdidos e em aberto',
}: SalesChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (value.startsWith('Semana')) return value.replace('Semana ', 'S')
                if (value.includes('-')) {
                  const [year, month] = value.split('-')
                  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
                  return months[parseInt(month) - 1] || value
                }
                return value
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Bar dataKey="won" name="Ganhos" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lost" name="Perdidos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="open" name="Em aberto" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface RevenueChartProps {
  data: DealsByPeriod[] | undefined
  isLoading: boolean
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valor por Período</CardTitle>
        <CardDescription>Valor total de negócios criados</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (value.startsWith('Semana')) return value.replace('Semana ', 'S')
                if (value.includes('-')) {
                  const [year, month] = value.split('-')
                  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
                  return months[parseInt(month) - 1] || value
                }
                return value
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value as number).replace('R$', '')}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value) => [formatCurrency(value as number), 'Valor']}
            />
            <Bar dataKey="value" name="Valor" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
