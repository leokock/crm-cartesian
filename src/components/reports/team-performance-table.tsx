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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import { type TeamPerformance } from '@/services/reports.service'
import { Trophy, Medal, Award } from 'lucide-react'

interface TeamPerformanceTableProps {
  data: TeamPerformance[] | undefined
  isLoading: boolean
}

export function TeamPerformanceTable({ data, isLoading }: TeamPerformanceTableProps) {
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

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-muted-foreground font-medium">{index + 1}</span>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho da Equipe</CardTitle>
        <CardDescription>Ranking de vendedores por valor total fechado</CardDescription>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-center">Ganhos</TableHead>
                <TableHead className="text-center">Perdidos</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Conversão</TableHead>
                <TableHead className="text-center">Atividades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((member, index) => (
                <TableRow key={member.userId}>
                  <TableCell className="font-medium">
                    <div className="flex justify-center">{getRankIcon(index)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(member.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {member.dealsWon}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {member.dealsLost}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(member.totalValue)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={member.conversionRate} className="h-2 flex-1" />
                      <span className="text-sm text-muted-foreground w-10">
                        {member.conversionRate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{member.activitiesCompleted}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado de desempenho disponível
          </div>
        )}
      </CardContent>
    </Card>
  )
}
