export type UserRole = "landlord" | "tenant" | "chef";
export type MembershipStatus = "active" | "inactive";
export type RoomStatus = "available" | "occupied" | "maintenance";
export type BillingCycle = "monthly" | "weekly";
export type InvoiceStatus = "draft" | "issued" | "partial" | "paid" | "overdue";
export type MaintenanceStatus = "open" | "in_progress" | "resolved";
export type MaintenancePriority = "low" | "medium" | "high";
export type PaymentMethod = "cash" | "bank_transfer" | "other";
export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";
export type PlanTier = "starter" | "growth" | "pro";

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Dorm {
  id: string;
  slug: string;
  name: string;
  address: string;
  contact: string;
  mealRate: number;
  billingCycle: BillingCycle;
  breakfastCutoff: string;
  lunchCutoff: string;
  dinnerCutoff: string;
  createdBy: string;
}

export interface SubscriptionEntitlement {
  dormId: string;
  planTier: PlanTier;
  roomLimit: number;
  mealManagementEnabled: boolean;
  reportsEnabled: boolean;
}

export interface Membership {
  id: string;
  userId: string;
  dormId: string;
  role: UserRole;
  status: MembershipStatus;
  dorm: Dorm;
}

export interface Invitation {
  id: string;
  dormId: string;
  email: string;
  role: UserRole;
  inviteToken: string;
  status: InvitationStatus;
  invitedBy: string;
  acceptedBy: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  dormId: string;
  number: string;
  floor: number;
  capacity: number;
  monthlyRent: number;
  status: RoomStatus;
  activeTenants: number;
}

export interface MemberDirectoryEntry {
  membershipId: string;
  dormId: string;
  role: UserRole;
  status: MembershipStatus;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  assignmentId: string | null;
  startDate: string | null;
  endDate: string | null;
  roomId: string | null;
  roomNumber: string | null;
  roomFloor: number | null;
  monthlyRent: number | null;
}

export interface MealPlan {
  id: string;
  dormId: string;
  serviceDate: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  createdBy: string;
}

export interface MealToggle {
  id: string;
  dormId: string;
  tenantMembershipId: string;
  serviceDate: string;
  breakfastEnabled: boolean;
  lunchEnabled: boolean;
  dinnerEnabled: boolean;
  breakfastLocked: boolean;
  lunchLocked: boolean;
  dinnerLocked: boolean;
}

export interface DailyMealCount {
  dormId: string;
  serviceDate: string;
  breakfastCount: number;
  lunchCount: number;
  dinnerCount: number;
  totalCount: number;
}

export interface MaintenanceTicket {
  id: string;
  dormId: string;
  tenantMembershipId: string;
  roomAssignmentId: string | null;
  category: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  dormId: string;
  tenantMembershipId: string;
  billingMonth: string;
  dueDate: string;
  rentAmount: number;
  mealAmount: number;
  adjustmentsAmount: number;
  totalAmount: number;
  amountPaid: number;
  status: InvoiceStatus;
  paidAt: string | null;
  tenantName?: string;
  tenantEmail?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  dormId: string;
  recordedBy: string;
  amount: number;
  method: PaymentMethod;
  notes: string | null;
  paidAt: string;
}

export interface RoomFormValues {
  id?: string;
  number: string;
  floor: number;
  capacity: number;
  monthlyRent: number;
  status: RoomStatus;
}

export interface DormFormValues {
  name: string;
  address: string;
  contact: string;
  mealRate: number;
  billingCycle: BillingCycle;
  breakfastCutoff: string;
  lunchCutoff: string;
  dinnerCutoff: string;
}

export interface InviteFormValues {
  email: string;
  role: UserRole;
}

export interface AssignmentFormValues {
  tenantMembershipId: string;
  roomId: string;
  startDate: string;
  endDate?: string | null;
}

export interface PaymentFormValues {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  paidAt?: string;
}

export interface MaintenanceFormValues {
  category: string;
  description: string;
  priority: MaintenancePriority;
}
