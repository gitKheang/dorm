import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  assignRoom,
  createInvitation,
  createMaintenanceTicket,
  generateMonthlyInvoices,
  getEntitlement,
  listDailyMealCounts,
  listInvitations,
  listInvoicesForDorm,
  listInvoicesForMembership,
  listMaintenanceForDorm,
  listMaintenanceForMembership,
  listMealPlans,
  listMealToggles,
  listMemberDirectory,
  listRooms,
  recordManualPayment,
  saveMealPlans,
  saveRoom,
  updateDorm,
  updateMaintenanceTicket,
  updateMealToggle,
  moveOut,
  ensureMealToggleWindow,
} from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  AssignmentFormValues,
  DormFormValues,
  InviteFormValues,
  MaintenanceFormValues,
  MaintenanceTicket,
  MealPlan,
  PaymentFormValues,
  RoomFormValues,
} from "@/types/domain";

export function useRooms(dormId?: string) {
  return useQuery({
    queryKey: queryKeys.rooms(dormId),
    queryFn: () => listRooms(dormId!),
    enabled: Boolean(dormId),
  });
}

export function useMemberDirectory(dormId?: string) {
  return useQuery({
    queryKey: queryKeys.memberDirectory(dormId),
    queryFn: () => listMemberDirectory(dormId!),
    enabled: Boolean(dormId),
  });
}

export function useInvitations(dormId?: string) {
  return useQuery({
    queryKey: queryKeys.invitations(dormId),
    queryFn: () => listInvitations(dormId!),
    enabled: Boolean(dormId),
  });
}

export function useEntitlement(dormId?: string) {
  return useQuery({
    queryKey: queryKeys.entitlements(dormId),
    queryFn: () => getEntitlement(dormId!),
    enabled: Boolean(dormId),
  });
}

export function useMealPlans(dormId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.mealPlans(dormId, startDate, endDate),
    queryFn: () => listMealPlans(dormId!, startDate!, endDate!),
    enabled: Boolean(dormId && startDate && endDate),
  });
}

export function useMealToggles(dormId?: string, membershipId?: string, startDate?: string, endDate?: string, dates: string[] = []) {
  return useQuery({
    queryKey: queryKeys.mealToggles(membershipId, startDate, endDate),
    queryFn: async () => {
      await ensureMealToggleWindow(dormId!, membershipId!, dates);
      return listMealToggles(membershipId!, startDate!, endDate!);
    },
    enabled: Boolean(dormId && membershipId && startDate && endDate && dates.length),
  });
}

export function useDailyMealCounts(dormId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.dailyMealCounts(dormId, startDate, endDate),
    queryFn: () => listDailyMealCounts(dormId!, startDate!, endDate!),
    enabled: Boolean(dormId && startDate && endDate),
  });
}

export function useInvoicesForDorm(dormId?: string) {
  return useQuery({
    queryKey: queryKeys.invoicesForDorm(dormId),
    queryFn: () => listInvoicesForDorm(dormId!),
    enabled: Boolean(dormId),
  });
}

export function useInvoicesForMembership(membershipId?: string) {
  return useQuery({
    queryKey: queryKeys.invoicesForMembership(membershipId),
    queryFn: () => listInvoicesForMembership(membershipId!),
    enabled: Boolean(membershipId),
  });
}

export function useMaintenanceForDorm(dormId?: string) {
  return useQuery({
    queryKey: queryKeys.maintenanceForDorm(dormId),
    queryFn: () => listMaintenanceForDorm(dormId!),
    enabled: Boolean(dormId),
  });
}

export function useMaintenanceForMembership(membershipId?: string) {
  return useQuery({
    queryKey: queryKeys.maintenanceForMembership(membershipId),
    queryFn: () => listMaintenanceForMembership(membershipId!),
    enabled: Boolean(membershipId),
  });
}

export function useDormMutations(dormId?: string) {
  const queryClient = useQueryClient();

  const invalidateDorm = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["rooms", dormId] }),
      queryClient.invalidateQueries({ queryKey: ["member-directory", dormId] }),
      queryClient.invalidateQueries({ queryKey: ["invitations", dormId] }),
      queryClient.invalidateQueries({ queryKey: ["meal-plans", dormId] }),
      queryClient.invalidateQueries({ queryKey: ["daily-meal-counts", dormId] }),
      queryClient.invalidateQueries({ queryKey: ["invoices", "dorm", dormId] }),
      queryClient.invalidateQueries({ queryKey: ["maintenance", "dorm", dormId] }),
      queryClient.invalidateQueries({ queryKey: ["entitlements", dormId] }),
    ]);
  };

  return {
    saveRoom: useMutation({
      mutationFn: (values: RoomFormValues) => saveRoom(dormId!, values),
      onSuccess: invalidateDorm,
    }),
    inviteMember: useMutation({
      mutationFn: ({ values, invitedBy }: { values: InviteFormValues; invitedBy: string }) =>
        createInvitation(dormId!, values, invitedBy),
      onSuccess: invalidateDorm,
    }),
    assignRoom: useMutation({
      mutationFn: (values: AssignmentFormValues) => assignRoom(dormId!, values),
      onSuccess: invalidateDorm,
    }),
    moveOut: useMutation({
      mutationFn: ({ assignmentId, endDate }: { assignmentId: string; endDate: string }) =>
        moveOut(assignmentId, endDate),
      onSuccess: invalidateDorm,
    }),
    saveMealPlans: useMutation({
      mutationFn: ({ createdBy, plans }: { createdBy: string; plans: Array<Pick<MealPlan, "serviceDate" | "breakfast" | "lunch" | "dinner">> }) =>
        saveMealPlans(dormId!, createdBy, plans),
      onSuccess: invalidateDorm,
    }),
    generateInvoices: useMutation({
      mutationFn: (billingMonth: string) => generateMonthlyInvoices(dormId!, billingMonth),
      onSuccess: invalidateDorm,
    }),
    recordPayment: useMutation({
      mutationFn: (values: PaymentFormValues) => recordManualPayment(values),
      onSuccess: invalidateDorm,
    }),
    updateMaintenance: useMutation({
      mutationFn: ({ ticketId, patch }: { ticketId: string; patch: Partial<MaintenanceTicket> }) =>
        updateMaintenanceTicket(ticketId, patch),
      onSuccess: invalidateDorm,
    }),
    updateDorm: useMutation({
      mutationFn: (values: DormFormValues) => updateDorm(dormId!, values),
      onSuccess: invalidateDorm,
    }),
  };
}

export function useTenantMutations(dormId?: string, membershipId?: string) {
  const queryClient = useQueryClient();

  const invalidateTenant = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["meal-toggles", membershipId] }),
      queryClient.invalidateQueries({ queryKey: ["invoices", "membership", membershipId] }),
      queryClient.invalidateQueries({ queryKey: ["maintenance", "membership", membershipId] }),
      queryClient.invalidateQueries({ queryKey: ["daily-meal-counts", dormId] }),
      queryClient.invalidateQueries({ queryKey: ["maintenance", "dorm", dormId] }),
    ]);
  };

  return {
    updateMealToggle: useMutation({
      mutationFn: ({ toggleId, patch }: { toggleId: string; patch: any }) => updateMealToggle(toggleId, patch),
      onSuccess: invalidateTenant,
    }),
    createMaintenance: useMutation({
      mutationFn: (values: MaintenanceFormValues) => createMaintenanceTicket(dormId!, membershipId!, values),
      onSuccess: invalidateTenant,
    }),
  };
}
