import { formatISO } from "date-fns";

import type {
  AssignmentFormValues,
  Dorm,
  DormFormValues,
  DailyMealCount,
  Invoice,
  Invitation,
  InviteFormValues,
  MaintenanceFormValues,
  MaintenanceTicket,
  MealPlan,
  MealToggle,
  Membership,
  MemberDirectoryEntry,
  PaymentFormValues,
  Profile,
  Room,
  RoomFormValues,
  SubscriptionEntitlement,
} from "@/types/domain";
import { requireSupabase } from "@/lib/supabase";

function assertSuccess<T>(payload: { data: T; error: any }) {
  if (payload.error) {
    throw new Error(payload.error.message || "Supabase request failed");
  }

  return payload.data;
}

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    phone: row.phone ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDorm(row: any): Dorm {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    address: row.address ?? "",
    contact: row.contact ?? "",
    mealRate: Number(row.meal_rate ?? 0),
    billingCycle: row.billing_cycle,
    breakfastCutoff: row.breakfast_cutoff,
    lunchCutoff: row.lunch_cutoff,
    dinnerCutoff: row.dinner_cutoff,
    createdBy: row.created_by,
  };
}

function mapMembership(row: any): Membership {
  return {
    id: row.id,
    userId: row.user_id,
    dormId: row.dorm_id,
    role: row.role,
    status: row.status,
    dorm: mapDorm(row.dorm),
  };
}

function mapRoom(row: any, occupancy = 0): Room {
  return {
    id: row.id,
    dormId: row.dorm_id,
    number: row.number,
    floor: Number(row.floor ?? 1),
    capacity: Number(row.capacity ?? 0),
    monthlyRent: Number(row.monthly_rent ?? 0),
    status: row.status,
    activeTenants: Number(occupancy ?? 0),
  };
}

function mapMemberDirectoryEntry(row: any): MemberDirectoryEntry {
  return {
    membershipId: row.membership_id,
    dormId: row.dorm_id,
    role: row.role,
    status: row.status,
    userId: row.user_id,
    email: row.email,
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    phone: row.phone ?? null,
    assignmentId: row.assignment_id ?? null,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    roomId: row.room_id ?? null,
    roomNumber: row.room_number ?? null,
    roomFloor: row.room_floor ? Number(row.room_floor) : null,
    monthlyRent: row.monthly_rent !== null && row.monthly_rent !== undefined ? Number(row.monthly_rent) : null,
  };
}

function mapInvitation(row: any): Invitation {
  return {
    id: row.id,
    dormId: row.dorm_id,
    email: row.email,
    role: row.role,
    inviteToken: row.invite_token,
    status: row.status,
    invitedBy: row.invited_by,
    acceptedBy: row.accepted_by ?? null,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMealPlan(row: any): MealPlan {
  return {
    id: row.id,
    dormId: row.dorm_id,
    serviceDate: row.service_date,
    breakfast: row.breakfast ?? "",
    lunch: row.lunch ?? "",
    dinner: row.dinner ?? "",
    createdBy: row.created_by,
  };
}

function mapMealToggle(row: any): MealToggle {
  return {
    id: row.id,
    dormId: row.dorm_id,
    tenantMembershipId: row.tenant_membership_id,
    serviceDate: row.service_date,
    breakfastEnabled: Boolean(row.breakfast_enabled),
    lunchEnabled: Boolean(row.lunch_enabled),
    dinnerEnabled: Boolean(row.dinner_enabled),
    breakfastLocked: Boolean(row.breakfast_locked),
    lunchLocked: Boolean(row.lunch_locked),
    dinnerLocked: Boolean(row.dinner_locked),
  };
}

function mapDailyMealCount(row: any): DailyMealCount {
  return {
    dormId: row.dorm_id,
    serviceDate: row.service_date,
    breakfastCount: Number(row.breakfast_count ?? 0),
    lunchCount: Number(row.lunch_count ?? 0),
    dinnerCount: Number(row.dinner_count ?? 0),
    totalCount: Number(row.total_count ?? 0),
  };
}

function mapMaintenance(row: any): MaintenanceTicket {
  return {
    id: row.id,
    dormId: row.dorm_id,
    tenantMembershipId: row.tenant_membership_id,
    roomAssignmentId: row.room_assignment_id ?? null,
    category: row.category,
    description: row.description,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInvoice(row: any): Invoice {
  return {
    id: row.id,
    dormId: row.dorm_id,
    tenantMembershipId: row.tenant_membership_id,
    billingMonth: row.billing_month,
    dueDate: row.due_date,
    rentAmount: Number(row.rent_amount ?? 0),
    mealAmount: Number(row.meal_amount ?? 0),
    adjustmentsAmount: Number(row.adjustments_amount ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    amountPaid: Number(row.amount_paid ?? 0),
    status: row.status,
    paidAt: row.paid_at ?? null,
    tenantName:
      row.first_name || row.last_name ? `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() : undefined,
    tenantEmail: row.email ?? undefined,
  };
}

export async function getAccountContext(userId: string) {
  const supabase = requireSupabase();

  const [profileResult, membershipsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("memberships")
      .select("id, user_id, dorm_id, role, status, dorm:dorm_id(*)")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at"),
  ]);

  const profile = mapProfile(assertSuccess(profileResult));
  const memberships = assertSuccess(membershipsResult).map(mapMembership);

  return { profile, memberships };
}

export async function updateProfile(userId: string, values: Pick<Profile, "firstName" | "lastName" | "phone">) {
  const supabase = requireSupabase();

  const result = await supabase
    .from("profiles")
    .update({
      first_name: values.firstName,
      last_name: values.lastName,
      phone: values.phone,
    })
    .eq("id", userId)
    .select("*")
    .single();

  return mapProfile(assertSuccess(result));
}

export async function createDorm(values: DormFormValues) {
  const supabase = requireSupabase();

  const result = await supabase.rpc("create_dorm", {
    p_name: values.name,
    p_address: values.address,
    p_contact: values.contact,
    p_meal_rate: values.mealRate,
    p_billing_cycle: values.billingCycle,
    p_breakfast_cutoff: values.breakfastCutoff,
    p_lunch_cutoff: values.lunchCutoff,
    p_dinner_cutoff: values.dinnerCutoff,
  });

  return assertSuccess(result);
}

export async function updateDorm(dormId: string, values: DormFormValues) {
  const supabase = requireSupabase();

  const result = await supabase
    .from("dorms")
    .update({
      name: values.name,
      address: values.address,
      contact: values.contact,
      meal_rate: values.mealRate,
      billing_cycle: values.billingCycle,
      breakfast_cutoff: values.breakfastCutoff,
      lunch_cutoff: values.lunchCutoff,
      dinner_cutoff: values.dinnerCutoff,
    })
    .eq("id", dormId)
    .select("*")
    .single();

  return mapDorm(assertSuccess(result));
}

export async function getEntitlement(dormId: string) {
  const supabase = requireSupabase();
  const result = await supabase.from("subscription_entitlements").select("*").eq("dorm_id", dormId).single();
  const row = assertSuccess(result);

  const entitlement: SubscriptionEntitlement = {
    dormId: row.dorm_id,
    planTier: row.plan_tier,
    roomLimit: Number(row.room_limit ?? 0),
    mealManagementEnabled: Boolean(row.meal_management_enabled),
    reportsEnabled: Boolean(row.reports_enabled),
  };

  return entitlement;
}

export async function listInvitations(dormId: string) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("invitations")
    .select("*")
    .eq("dorm_id", dormId)
    .order("created_at", { ascending: false });

  return assertSuccess(result).map(mapInvitation);
}

export async function createInvitation(dormId: string, values: InviteFormValues, invitedBy: string) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("invitations")
    .insert({
      dorm_id: dormId,
      email: values.email.toLowerCase(),
      role: values.role,
      invited_by: invitedBy,
    })
    .select("*")
    .single();

  return mapInvitation(assertSuccess(result));
}

export async function getInvitationByToken(token: string) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("invitations")
    .select("*")
    .eq("invite_token", token)
    .maybeSingle();

  const row = assertSuccess(result);
  return row ? mapInvitation(row) : null;
}

export async function acceptInvitation(token: string) {
  const supabase = requireSupabase();
  const result = await supabase.rpc("accept_invitation", { p_token: token });
  return assertSuccess(result);
}

export async function listRooms(dormId: string) {
  const supabase = requireSupabase();

  const [roomsResult, occupancyResult] = await Promise.all([
    supabase.from("rooms").select("*").eq("dorm_id", dormId).order("number"),
    supabase.from("room_occupancy").select("*").eq("dorm_id", dormId),
  ]);

  const occupancy = new Map<string, number>();
  assertSuccess(occupancyResult).forEach((row: any) => {
    occupancy.set(row.room_id, Number(row.active_tenants ?? 0));
  });

  return assertSuccess(roomsResult).map((row: any) => mapRoom(row, occupancy.get(row.id) ?? 0));
}

export async function saveRoom(dormId: string, values: RoomFormValues) {
  const supabase = requireSupabase();

  const payload = {
    dorm_id: dormId,
    number: values.number,
    floor: values.floor,
    capacity: values.capacity,
    monthly_rent: values.monthlyRent,
    status: values.status,
  };

  if (values.id) {
    const result = await supabase.from("rooms").update(payload).eq("id", values.id).select("*").single();
    return mapRoom(assertSuccess(result));
  }

  const result = await supabase.from("rooms").insert(payload).select("*").single();
  return mapRoom(assertSuccess(result));
}

export async function listMemberDirectory(dormId: string) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("member_directory")
    .select("*")
    .eq("dorm_id", dormId)
    .eq("status", "active")
    .order("first_name");

  return assertSuccess(result).map(mapMemberDirectoryEntry);
}

export async function assignRoom(dormId: string, values: AssignmentFormValues) {
  const supabase = requireSupabase();

  await supabase
    .from("room_assignments")
    .update({ end_date: values.endDate ?? values.startDate })
    .eq("tenant_membership_id", values.tenantMembershipId)
    .is("end_date", null);

  const result = await supabase
    .from("room_assignments")
    .insert({
      dorm_id: dormId,
      room_id: values.roomId,
      tenant_membership_id: values.tenantMembershipId,
      start_date: values.startDate,
      end_date: values.endDate ?? null,
    })
    .select("*")
    .single();

  return assertSuccess(result);
}

export async function moveOut(assignmentId: string, endDate: string) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("room_assignments")
    .update({ end_date: endDate })
    .eq("id", assignmentId)
    .select("*")
    .single();

  return assertSuccess(result);
}

export async function listMealPlans(dormId: string, startDate: string, endDate: string) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("meal_plans")
    .select("*")
    .eq("dorm_id", dormId)
    .gte("service_date", startDate)
    .lte("service_date", endDate)
    .order("service_date");

  return assertSuccess(result).map(mapMealPlan);
}

export async function saveMealPlans(dormId: string, createdBy: string, plans: Array<Pick<MealPlan, "serviceDate" | "breakfast" | "lunch" | "dinner">>) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("meal_plans")
    .upsert(
      plans.map((plan) => ({
        dorm_id: dormId,
        service_date: plan.serviceDate,
        breakfast: plan.breakfast,
        lunch: plan.lunch,
        dinner: plan.dinner,
        created_by: createdBy,
      })),
      { onConflict: "dorm_id,service_date" },
    )
    .select("*");

  return assertSuccess(result).map(mapMealPlan);
}

export async function ensureMealToggleWindow(dormId: string, membershipId: string, dates: string[]) {
  const supabase = requireSupabase();

  await supabase.from("meal_toggles").upsert(
    dates.map((serviceDate) => ({
      dorm_id: dormId,
      tenant_membership_id: membershipId,
      service_date: serviceDate,
      breakfast_enabled: true,
      lunch_enabled: true,
      dinner_enabled: true,
    })),
    { onConflict: "tenant_membership_id,service_date", ignoreDuplicates: true },
  );
}

export async function listMealToggles(membershipId: string, startDate: string, endDate: string) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("meal_toggles")
    .select("*")
    .eq("tenant_membership_id", membershipId)
    .gte("service_date", startDate)
    .lte("service_date", endDate)
    .order("service_date");

  return assertSuccess(result).map(mapMealToggle);
}

export async function updateMealToggle(toggleId: string, patch: Partial<MealToggle>) {
  const supabase = requireSupabase();
  const payload: Record<string, boolean> = {};

  if (patch.breakfastEnabled !== undefined) payload.breakfast_enabled = patch.breakfastEnabled;
  if (patch.lunchEnabled !== undefined) payload.lunch_enabled = patch.lunchEnabled;
  if (patch.dinnerEnabled !== undefined) payload.dinner_enabled = patch.dinnerEnabled;

  const result = await supabase
    .from("meal_toggles")
    .update(payload)
    .eq("id", toggleId)
    .select("*")
    .single();

  return mapMealToggle(assertSuccess(result));
}

export async function listDailyMealCounts(dormId: string, startDate: string, endDate: string) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("daily_meal_counts")
    .select("*")
    .eq("dorm_id", dormId)
    .gte("service_date", startDate)
    .lte("service_date", endDate)
    .order("service_date");

  return assertSuccess(result).map(mapDailyMealCount);
}

export async function listInvoicesForDorm(dormId: string) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("invoice_overview")
    .select("*")
    .eq("dorm_id", dormId)
    .order("billing_month", { ascending: false });

  return assertSuccess(result).map(mapInvoice);
}

export async function listInvoicesForMembership(membershipId: string) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("invoices")
    .select("*")
    .eq("tenant_membership_id", membershipId)
    .order("billing_month", { ascending: false });

  return assertSuccess(result).map(mapInvoice);
}

export async function generateMonthlyInvoices(dormId: string, billingMonth: string) {
  const supabase = requireSupabase();
  const result = await supabase.rpc("generate_monthly_invoices", {
    p_dorm_id: dormId,
    p_billing_month: billingMonth,
  });

  return assertSuccess(result);
}

export async function recordManualPayment(values: PaymentFormValues) {
  const supabase = requireSupabase();
  const result = await supabase.rpc("record_manual_payment", {
    p_invoice_id: values.invoiceId,
    p_amount: values.amount,
    p_method: values.method,
    p_notes: values.notes ?? null,
    p_paid_at: values.paidAt ?? formatISO(new Date()),
  });

  return assertSuccess(result);
}

export async function listMaintenanceForDorm(dormId: string) {
  const supabase = requireSupabase();
  const [ticketsResult, memberResult] = await Promise.all([
    supabase
      .from("maintenance_tickets")
      .select("*")
      .eq("dorm_id", dormId)
      .order("created_at", { ascending: false }),
    listMemberDirectory(dormId),
  ]);

  const memberMap = new Map(memberResult.map((entry) => [entry.membershipId, entry]));
  return assertSuccess(ticketsResult).map((row: any) => {
    const ticket = mapMaintenance(row);
    const member = memberMap.get(ticket.tenantMembershipId);

    return {
      ...ticket,
      tenantName: member ? `${member.firstName} ${member.lastName}` : "Unknown tenant",
      roomNumber: member?.roomNumber ?? null,
    };
  });
}

export async function listMaintenanceForMembership(membershipId: string) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("maintenance_tickets")
    .select("*")
    .eq("tenant_membership_id", membershipId)
    .order("created_at", { ascending: false });

  return assertSuccess(result).map(mapMaintenance);
}

export async function createMaintenanceTicket(dormId: string, membershipId: string, values: MaintenanceFormValues) {
  const supabase = requireSupabase();
  const result = await supabase
    .from("maintenance_tickets")
    .insert({
      dorm_id: dormId,
      tenant_membership_id: membershipId,
      category: values.category,
      description: values.description,
      priority: values.priority,
    })
    .select("*")
    .single();

  return mapMaintenance(assertSuccess(result));
}

export async function updateMaintenanceTicket(ticketId: string, patch: Partial<MaintenanceTicket>) {
  const supabase = requireSupabase();
  const payload: Record<string, string> = {};

  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.priority !== undefined) payload.priority = patch.priority;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.category !== undefined) payload.category = patch.category;

  const result = await supabase
    .from("maintenance_tickets")
    .update(payload)
    .eq("id", ticketId)
    .select("*")
    .single();

  return mapMaintenance(assertSuccess(result));
}
