'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useOrganizationMembers, useUpdateMemberRole, useProfile } from '@/hooks/use-settings'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Users, UserPlus, Shield, Crown, User, Loader2, Plus } from 'lucide-react'

const roleLabels = {
  admin: 'Administrador',
  manager: 'Gerente',
  user: 'Usuário',
}

const roleIcons = {
  admin: Crown,
  manager: Shield,
  user: User,
}

const roleBadgeVariants = {
  admin: 'default' as const,
  manager: 'secondary' as const,
  user: 'outline' as const,
}

function MemberSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-9 w-32" />
      </TableCell>
    </TableRow>
  )
}

export default function UsersSettingsPage() {
  const { toast } = useToast()
  const { data: currentUser } = useProfile()
  const { data: members, isLoading, refetch } = useOrganizationMembers()
  const updateRole = useUpdateMemberRole()
  const [changingRole, setChangingRole] = useState<{ memberId: string; newRole: 'admin' | 'manager' | 'user' } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user' as 'admin' | 'manager' | 'user',
  })
  const supabase = createClient()

  const isAdmin = currentUser?.role === 'admin'

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name,
            skip_org_creation: true,
          },
        },
      })

      if (authError) throw authError

      if (authData.user && currentUser?.organization_id) {
        // Create profile for the new user in the same organization
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            organization_id: currentUser.organization_id,
            email: newUser.email,
            full_name: newUser.full_name,
            role: newUser.role,
          })

        if (profileError) throw profileError

        toast({
          title: 'Usuário criado',
          description: `${newUser.full_name} foi adicionado à equipe.`,
        })

        setIsDialogOpen(false)
        setNewUser({ email: '', password: '', full_name: '', role: 'user' })
        refetch()
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast({
        title: 'Erro ao criar usuário',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleRoleChange = async () => {
    if (!changingRole) return

    try {
      await updateRole.mutateAsync({
        memberId: changingRole.memberId,
        role: changingRole.newRole,
      })
      toast({
        title: 'Função atualizada',
        description: 'A função do usuário foi alterada com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao alterar a função.',
        variant: 'destructive',
      })
    } finally {
      setChangingRole(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários da Organização
              </CardTitle>
              <CardDescription>
                Gerencie os membros da sua equipe
              </CardDescription>
            </div>
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateUser}>
                    <DialogHeader>
                      <DialogTitle>Adicionar Usuário</DialogTitle>
                      <DialogDescription>
                        Crie uma nova conta para um membro da equipe
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nome Completo</Label>
                        <Input
                          id="full_name"
                          value={newUser.full_name}
                          onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                          placeholder="João Silva"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          placeholder="joao@empresa.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="Mínimo 6 caracteres"
                          minLength={6}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Função</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value: 'admin' | 'manager' | 'user') =>
                            setNewUser({ ...newUser, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="user">Usuário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Usuário
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isAdmin && (
            <div className="mb-4 p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">
                Apenas administradores podem gerenciar usuários. Entre em contato com um administrador para fazer alterações.
              </p>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Membro desde</TableHead>
                {isAdmin && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  <MemberSkeleton />
                  <MemberSkeleton />
                  <MemberSkeleton />
                </>
              ) : !members || members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => {
                  const RoleIcon = roleIcons[member.role]
                  const isCurrentUser = member.id === currentUser?.id

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback>
                              {member.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.full_name || 'Sem nome'}
                              {isCurrentUser && (
                                <span className="text-muted-foreground text-xs ml-2">(você)</span>
                              )}
                            </p>
                            {member.job_title && (
                              <p className="text-sm text-muted-foreground">
                                {member.job_title}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariants[member.role]} className="gap-1">
                          <RoleIcon className="h-3 w-3" />
                          {roleLabels[member.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(member.created_at)}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          {!isCurrentUser ? (
                            <Select
                              value={member.role}
                              onValueChange={(value) =>
                                setChangingRole({
                                  memberId: member.id,
                                  newRole: value as 'admin' | 'manager' | 'user',
                                })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="manager">Gerente</SelectItem>
                                <SelectItem value="user">Usuário</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role descriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funções e Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-primary" />
                <span className="font-medium">Administrador</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Acesso total ao sistema. Pode gerenciar usuários, configurações e todos os dados.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Gerente</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Pode gerenciar negócios, clientes e projetos. Acesso a relatórios da equipe.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">Usuário</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Acesso básico para gerenciar seus próprios negócios e atividades.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Role Confirmation Dialog */}
      <AlertDialog open={!!changingRole} onOpenChange={(open) => !open && setChangingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar função do usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a alterar a função deste usuário para{' '}
              <strong>{changingRole ? roleLabels[changingRole.newRole] : ''}</strong>.
              Isso pode afetar suas permissões no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
