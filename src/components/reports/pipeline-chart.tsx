'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { type PipelineReport } from '@/services/reports.service'

interface PipelineChartProps {
  data: PipelineReport[] | undefined
  isLoading: boolean
}

export function PipelineDealsChart({ data, isLoading }: PipelineChartProps) {
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
        <CardTitle>Negócios por Estágio</CardTitle>
        <CardDescription>Quantidade de negócios em cada estágio do pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data || []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="stageName"
              type="category"
              tick={{ fontSize: 12 }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="dealsCount" name="Negócios" radius={[0, 4, 4, 0]}>
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.stageColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function PipelineValueChart({ data, isLoading }: PipelineChartProps) {
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
        <CardTitle>Valor por Estágio</CardTitle>
        <CardDescription>Valor total de negócios em cada estágio</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data || []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value as number).replace('R$', '')}
            />
            <YAxis
              dataKey="stageName"
              type="category"
              tick={{ fontSize: 12 }}
              width={120}
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
            <Bar dataKey="dealsValue" name="Valor" radius={[0, 4, 4, 0]}>
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.stageColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function PipelinePieChart({ data, isLoading }: PipelineChartProps) {
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
    name: item.stageName,
    value: item.dealsCount,
    color: item.stageColor,
  })) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Estágio</CardTitle>
        <CardDescription>Proporção de negócios em cada estágio</CardDescription>
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
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
