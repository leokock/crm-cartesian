'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DateRangePicker,
  ReportSummaryCards,
  SalesChart,
  RevenueChart,
  PipelinePieChart,
} from '@/components/reports'
import {
  useReportSummary,
  useDealsByPeriod,
  usePipelineReport,
  useDefaultDateRange,
} from '@/hooks/use-reports'
import { type DateRange } from '@/services/reports.service'
import { Download } from 'lucide-react'

export default function ReportsOverviewPage() {
  const defaultRange = useDefaultDateRange()
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange)
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month')

  const { data: summary, isLoading: summaryLoading } = useReportSummary(dateRange)
  const { data: dealsByPeriod, isLoading: dealsLoading } = useDealsByPeriod(dateRange, groupBy)
  const { data: pipelineData, isLoading: pipelineLoading } = usePipelineReport()

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
        </div>
      </div>

      {/* Summary Cards */}
      <ReportSummaryCards data={summary} isLoading={summaryLoading} />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart data={dealsByPeriod} isLoading={dealsLoading} />
        <RevenueChart data={dealsByPeriod} isLoading={dealsLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PipelinePieChart data={pipelineData} isLoading={pipelineLoading} />
      </div>
    </div>
  )
}
