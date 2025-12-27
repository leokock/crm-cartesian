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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { type ActivityReport } from '@/services/reports.service'

const ACTIVITY_COLORS: Record<string, string> = {
  call: '#3b82f6',
  meeting: '#8b5cf6',
  email: '#06b6d4',
  task: '#22c55e',
  note: '#f59e0b',
  visit: '#ec4899',
}

const ACTIVITY_LABELS: Record<string, string> = {
  call: 'Ligação',
  meeting: 'Reunião',
  email: 'E-mail',
  task: 'Tarefa',
  note: 'Nota',
  visit: 'Visita',
}

interface ActivityChartProps {
  data: ActivityReport[] | undefined
  isLoading: boolean
}

export function ActivityCompletionChart({ data, isLoading }: ActivityChartProps) {
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
        <CardTitle>Atividades por Período</CardTitle>
        <CardDescription>Atividades concluídas vs pendentes</CardDescription>
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
            <Bar
              dataKey="completedActivities"
              name="Concluídas"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="pendingActivities"
              name="Pendentes"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function ActivityCompletionRateChart({ data, isLoading }: ActivityChartProps) {
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
        <CardTitle>Taxa de Conclusão</CardTitle>
        <CardDescription>Percentual de atividades concluídas por período</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data || []}>
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
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value) => [`${value}%`, 'Taxa']}
            />
            <Line
              type="monotone"
              dataKey="completionRate"
              name="Taxa de Conclusão"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface ActivityTypeChartProps {
  data: { type: string; count: number }[] | undefined
  isLoading: boolean
}

export function ActivityTypeChart({ data, isLoading }: ActivityTypeChartProps) {
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

  const pieData = data?.map((item) => ({
    name: ACTIVITY_LABELS[item.type] || item.type,
    value: item.count,
    color: ACTIVITY_COLORS[item.type] || '#6b7280',
  })) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades por Tipo</CardTitle>
        <CardDescription>Distribuição de atividades por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
