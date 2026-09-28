import { handleResponse } from '@freetheplatform/web-security';

import { authedFetch, type Paginated } from './api';
import {
  STAFF_ACCOUNTS_API,
  type StaffAccountDetail,
  type StaffAccountRole,
  type StaffAccountRow,
} from '@/types/StaffAccount';

export async function adminGetAccounts(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<StaffAccountRow>> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return handleResponse(await authedFetch(`${STAFF_ACCOUNTS_API}?${query.toString()}`));
}

export async function adminGetAccountRoles(): Promise<StaffAccountRole[]> {
  return handleResponse(await authedFetch(`${STAFF_ACCOUNTS_API}roles/`));
}

export async function adminGetAccount(id: number): Promise<StaffAccountDetail> {
  return handleResponse(await authedFetch(`${STAFF_ACCOUNTS_API}${id}/`));
}

export async function adminUnlockAccount(id: number): Promise<StaffAccountDetail> {
  return handleResponse(
    await authedFetch(`${STAFF_ACCOUNTS_API}${id}/unlock/`, { method: 'POST' }),
  );
}

export async function adminSendAccountResetLink(id: number): Promise<{ detail: string }> {
  return handleResponse(
    await authedFetch(`${STAFF_ACCOUNTS_API}${id}/password-reset/`, { method: 'POST' }),
  );
}
