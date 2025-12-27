'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { formatCurrency } from '@/lib/utils'
import { type ClientRevenue } from '@/services/reports.service'
import { Building2 } from 'lucide-react'

interface ClientRevenueTableProps {
  data: ClientRevenue[] | undefined
  isLoading: boolean
  limit?: number
}

export function ClientRevenueTable({ data, isLoading, limit = 10 }: ClientRevenueTableProps) {
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

  const displayData = data?.slice(0, limit) || []
  const maxValue = Math.max(...(displayData.map((d) => d.wonValue) || [1]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita por Cliente</CardTitle>
        <CardDescription>Top {limit} clientes por valor de negócios fechados</CardDescription>
      </CardHeader>
      <CardContent>
        {displayData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-center">Negócios</TableHead>
                <TableHead className="text-center">Ganhos</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Valor Ganho</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((client) => {
                const percentage = maxValue > 0 ? (client.wonValue / maxValue) * 100 : 0

                return (
                  <TableRow key={client.clientId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{client.clientName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{client.totalDeals}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {client.wonDeals}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(client.totalValue)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(client.wonValue)}
                    </TableCell>
                    <TableCell>
                      <Progress value={percentage} className="h-2" />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado de receita disponível
          </div>
        )}
      </CardContent>
    </Card>
  )
}
