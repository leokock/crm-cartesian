'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { TrendingUp, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { usePipelineStats } from '@/hooks/use-dashboard'
import { ROUTES } from '@/lib/constants/routes'

function FunnelSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function PipelineFunnel() {
  const { data: pipelineStats, isLoading } = usePipelineStats()

  const totalDeals = pipelineStats?.reduce((sum, stage) => sum + stage.count, 0) || 0
  const totalValue = pipelineStats?.reduce((sum, stage) => sum + stage.total_value, 0) || 0

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Pipeline de Vendas
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.PIPELINE}>
            Ver pipeline
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <FunnelSkeleton />
        ) : !pipelineStats || pipelineStats.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            <p>Configure seu primeiro pipeline para ver o funil de vendas aqui.</p>
          </div>
        ) : totalDeals === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
            <p>Nenhum negócio no pipeline ainda.</p>
            <Button variant="link" asChild className="mt-2">
              <Link href={ROUTES.PIPELINE}>Criar primeiro negócio</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {pipelineStats.map((stage, index) => {
              const maxWidth = 100
              const minWidth = 40
              const widthStep = (maxWidth - minWidth) / Math.max(pipelineStats.length - 1, 1)
              const width = maxWidth - (index * widthStep)
              const percentage = totalDeals > 0 ? Math.round((stage.count / totalDeals) * 100) : 0

              return (
                <div key={stage.stage_id} className="relative">
                  <div
                    className="relative mx-auto rounded-md p-3 transition-all hover:opacity-90"
                    style={{
                      width: `${width}%`,
                      backgroundColor: stage.stage_color + '20',
                      borderLeft: `4px solid ${stage.stage_color}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: stage.stage_color }}
                        />
                        <span className="font-medium text-sm">{stage.stage_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">{stage.count}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                    {stage.total_value > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 pl-4">
                        {formatCurrency(stage.total_value)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Totals */}
            <div className="flex justify-between items-center pt-4 border-t mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Total de negócios</p>
                <p className="text-lg font-bold">{totalDeals}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor total</p>
                <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
