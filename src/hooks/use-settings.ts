'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCurrentProfile,
  updateProfile,
  getCurrentOrganization,
  updateOrganization,
  getOrganizationMembers,
  updateMemberRole,
  changePassword,
  type ProfileUpdateData,
  type OrganizationUpdateData,
} from '@/services/settings.service'

export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  organization: () => [...settingsKeys.all, 'organization'] as const,
  members: () => [...settingsKeys.all, 'members'] as const,
}

export function useProfile() {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: getCurrentProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProfileUpdateData) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() })
    },
  })
}

export function useOrganization() {
  return useQuery({
    queryKey: settingsKeys.organization(),
    queryFn: getCurrentOrganization,
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationUpdateData) => updateOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.organization() })
    },
  })
}

export function useOrganizationMembers() {
  return useQuery({
    queryKey: settingsKeys.members(),
    queryFn: getOrganizationMembers,
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: 'admin' | 'manager' | 'sales_rep' }) =>
      updateMemberRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.members() })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword),
  })
}
