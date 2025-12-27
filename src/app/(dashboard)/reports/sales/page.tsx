'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DateRangePicker,
  SalesChart,
  RevenueChart,
} from '@/components/reports'
import {
  useSalesReport,
  useDealsByPeriod,
  useDefaultDateRange,
} from '@/hooks/use-reports'
import { exportToCSV, type DateRange, type SalesReport } from '@/services/reports.service'
import { formatCurrency } from '@/lib/utils'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'

export default function SalesReportPage() {
  const defaultRange = useDefaultDateRange()
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange)
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month')

  const { data: salesReport, isLoading: salesLoading } = useSalesReport(dateRange, groupBy)
  const { data: dealsByPeriod, isLoading: dealsLoading } = useDealsByPeriod(dateRange, groupBy)

  const handleExport = () => {
    if (!salesReport) return

    exportToCSV(salesReport, 'relatorio-vendas', [
      { key: 'period', label: 'Período' },
      { key: 'totalDeals', label: 'Total de Negócios' },
      { key: 'wonDeals', label: 'Ganhos' },
      { key: 'lostDeals', label: 'Perdidos' },
      { key: 'openDeals', label: 'Em Aberto' },
      { key: 'totalValue', label: 'Valor Total' },
      { key: 'wonValue', label: 'Valor Ganho' },
      { key: 'conversionRate', label: 'Taxa de Conversão (%)' },
    ])
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <div className="flex items-center gap-2">
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as typeof groupBy)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Agrupar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Por Dia</SelectItem>
              <SelectItem value="week">Por Semana</SelectItem>
              <SelectItem value="month">Por Mês</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExport} disabled={!salesReport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart data={dealsByPeriod} isLoading={dealsLoading} />
        <RevenueChart data={dealsByPeriod} isLoading={dealsLoading} />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Detalhados</CardTitle>
          <CardDescription>Métricas de vendas por período</CardDescription>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : salesReport && salesReport.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Ganhos</TableHead>
                  <TableHead className="text-center">Perdidos</TableHead>
                  <TableHead className="text-center">Em Aberto</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Valor Ganho</TableHead>
                  <TableHead className="text-center">Conversão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesReport.map((row) => (
                  <TableRow key={row.period}>
                    <TableCell className="font-medium">{row.period}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{row.totalDeals}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {row.wonDeals}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {row.lostDeals}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{row.openDeals}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(row.totalValue)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(row.wonValue)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {row.conversionRate >= 50 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={row.conversionRate >= 50 ? 'text-green-600' : 'text-red-600'}>
                          {row.conversionRate}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado disponível para o período selecionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
