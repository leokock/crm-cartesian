'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Progress } from '@/components/ui/progress'
import {
  PipelineDealsChart,
  PipelineValueChart,
  PipelinePieChart,
} from '@/components/reports'
import { usePipelineReport } from '@/hooks/use-reports'
import { exportToCSV, type PipelineReport } from '@/services/reports.service'
import { formatCurrency } from '@/lib/utils'
import { Download } from 'lucide-react'

export default function PipelineReportPage() {
  const { data: pipelineData, isLoading } = usePipelineReport()

  const handleExport = () => {
    if (!pipelineData) return

    exportToCSV(pipelineData, 'relatorio-pipeline', [
      { key: 'stageName', label: 'Estágio' },
      { key: 'dealsCount', label: 'Qtd Negócios' },
      { key: 'dealsValue', label: 'Valor Total' },
    ])
  }

  const totalDeals = pipelineData?.reduce((sum, s) => sum + s.dealsCount, 0) || 0
  const totalValue = pipelineData?.reduce((sum, s) => sum + s.dealsValue, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Análise do Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            Visão detalhada dos negócios em cada estágio
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!pipelineData}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Negócios</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{totalDeals}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total no Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estágios Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{pipelineData?.length || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PipelineDealsChart data={pipelineData} isLoading={isLoading} />
        <PipelineValueChart data={pipelineData} isLoading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PipelinePieChart data={pipelineData} isLoading={isLoading} />

        {/* Stage Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes por Estágio</CardTitle>
            <CardDescription>Métricas detalhadas de cada estágio</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : pipelineData && pipelineData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estágio</TableHead>
                    <TableHead className="text-center">Negócios</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[100px]">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pipelineData.map((stage) => {
                    const percentage = totalDeals > 0
                      ? Math.round((stage.dealsCount / totalDeals) * 100)
                      : 0

                    return (
                      <TableRow key={stage.stageId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: stage.stageColor }}
                            />
                            <span className="font-medium">{stage.stageName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{stage.dealsCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(stage.dealsValue)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="h-2" />
                            <span className="text-xs text-muted-foreground w-8">
                              {percentage}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum estágio com negócios
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
