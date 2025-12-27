'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Building2,
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  User,
  FolderKanban,
  Mail,
  Plus,
  CheckSquare,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useDeleteDeal, useUpdateDealStatus } from '@/hooks/use-deals'
import { useActivities } from '@/hooks/use-activities'
import { useToast } from '@/hooks/use-toast'
import { ActivityTimeline, ActivityFormDialog } from '@/components/activities'
import type { DealWithRelations } from '@/services/deals.service'

interface DealDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: DealWithRelations | null
  onEdit: (deal: DealWithRelations) => void
}

export function DealDetailSheet({
  open,
  onOpenChange,
  deal,
  onEdit,
}: DealDetailSheetProps) {
  const { toast } = useToast()
  const deleteDeal = useDeleteDeal()
  const updateStatus = useUpdateDealStatus()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showWonDialog, setShowWonDialog] = useState(false)
  const [showLostDialog, setShowLostDialog] = useState(false)
  const [showActivityForm, setShowActivityForm] = useState(false)

  const { data: activities } = useActivities(deal ? { deal_id: deal.id } : undefined)

  if (!deal) return null

  const contactName = deal.contact
    ? `${deal.contact.first_name}${deal.contact.last_name ? ` ${deal.contact.last_name}` : ''}`
    : null

  async function handleDelete() {
    try {
      await deleteDeal.mutateAsync(deal!.id)
      toast({
        title: 'Negócio excluído',
        description: 'O negócio foi excluído com sucesso.',
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir o negócio.',
        variant: 'destructive',
      })
    }
  }

  async function handleMarkAsWon() {
    try {
      await updateStatus.mutateAsync({ id: deal!.id, status: 'won' })
      toast({
        title: 'Negócio ganho!',
        description: 'O negócio foi marcado como ganho.',
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar o negócio.',
        variant: 'destructive',
      })
    }
  }

  async function handleMarkAsLost() {
    try {
      await updateStatus.mutateAsync({ id: deal!.id, status: 'lost' })
      toast({
        title: 'Negócio perdido',
        description: 'O negócio foi marcado como perdido.',
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar o negócio.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-lg">{deal.title}</SheetTitle>
                {deal.stage && (
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: deal.stage.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {deal.stage.name}
                    </span>
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(deal)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowWonDialog(true)}
                    className="text-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Ganho
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowLostDialog(true)}
                    className="text-red-600"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Marcar como Perdido
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Value */}
            {deal.value && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Valor
                </h4>
                <Badge variant="secondary" className="text-lg font-semibold">
                  {formatCurrency(deal.value)}
                </Badge>
              </div>
            )}

            {/* Company */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Empresa
                </h4>
                <p className="text-sm">{deal.company?.name || '-'}</p>
              </div>
            </div>

            {/* Project */}
            {deal.project && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Projeto
                  </h4>
                  <p className="text-sm">{deal.project.name}</p>
                </div>
              </div>
            )}

            {/* Contact */}
            {contactName && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Contato
                  </h4>
                  <p className="text-sm">{contactName}</p>
                </div>
              </div>
            )}

            {/* Expected Close Date */}
            {deal.expected_close_date && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Previsão de Fechamento
                  </h4>
                  <p className="text-sm">{formatDate(deal.expected_close_date)}</p>
                </div>
              </div>
            )}

            {/* Owner */}
            {deal.owner && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={deal.owner.avatar_url || undefined} />
                  <AvatarFallback>
                    {deal.owner.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Responsável
                  </h4>
                  <p className="text-sm">{deal.owner.full_name || 'Sem nome'}</p>
                </div>
              </div>
            )}

            {/* Description */}
            {deal.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Descrição
                </h4>
                <p className="text-sm whitespace-pre-wrap">{deal.description}</p>
              </div>
            )}

            {/* Activities */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Atividades
                </h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowActivityForm(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {activities && activities.length > 0 ? (
                <div className="max-h-[200px] overflow-y-auto">
                  <ActivityTimeline activities={activities.slice(0, 5)} showRelations={false} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma atividade
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="pt-4 border-t text-xs text-muted-foreground">
              <p>Criado em: {formatDate(deal.created_at)}</p>
              <p>Atualizado em: {formatDate(deal.updated_at)}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir negócio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O negócio será permanentemente
              removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Won Confirmation Dialog */}
      <AlertDialog open={showWonDialog} onOpenChange={setShowWonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como Ganho?</AlertDialogTitle>
            <AlertDialogDescription>
              O negócio será marcado como ganho e removido do pipeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkAsWon}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Marcar como Ganho
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lost Confirmation Dialog */}
      <AlertDialog open={showLostDialog} onOpenChange={setShowLostDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como Perdido?</AlertDialogTitle>
            <AlertDialogDescription>
              O negócio será marcado como perdido e removido do pipeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkAsLost}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Marcar como Perdido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activity Form Dialog */}
      <ActivityFormDialog
        open={showActivityForm}
        onOpenChange={setShowActivityForm}
        defaultValues={{
          deal_id: deal.id,
          company_id: deal.company_id,
        }}
      />
    </>
  )
}
