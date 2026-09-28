/**
 * The staff users API, `freetheplatform.auth.staff` mounted at
 * `/api/admin/users/`. The payload is the package's, so this file is identical
 * in allbikes, bloomprint and freethedesk; change all three or none.
 */

export interface StaffAccountRow {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  /** The site's role, for display and filtering only — never for gating. */
  role: string;
  role_label: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
  locked: boolean;
}

export interface StaffAccountSecurity {
  has_usable_password: boolean;
  must_change_password: boolean;
  failure_count: number;
  last_failure_at: string | null;
  locked_until: string | null;
}

export interface StaffAccountActivityRow {
  reference: string;
  summary: string;
  status: string;
  date: string | null;
  href: string | null;
}

export interface StaffAccountActivity {
  key: string;
  title: string;
  total: number;
  rows: StaffAccountActivityRow[];
}

export interface StaffAccountDetail extends StaffAccountRow {
  security: StaffAccountSecurity;
  details: { label: string; value: string | null }[];
  activity: StaffAccountActivity[];
  /** False for a superuser, unless you are one. */
  can_manage: boolean;
  is_self: boolean;
}

export interface StaffAccountRole {
  value: string;
  label: string;
}

export const STAFF_ACCOUNTS_API = '/api/admin/users/';
export const STAFF_ACCOUNTS_PATH = '/dashboard/admin/users';
