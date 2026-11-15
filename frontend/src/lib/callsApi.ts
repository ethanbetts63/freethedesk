import { handleResponse } from '@freetheplatform/web-security';

import { authedFetch, queryString, type Paginated } from './api';

/** Content type for a call-back request, for the messages it sent. */
export const CALL_REQUEST_TYPE = 'seo.seocallrequest';

export type CallStatus = 'new' | 'called' | 'no_answer' | 'closed';

/** A request from the site to be rung back, as the dashboard shows it. */
export interface CallRequest {
  id: number;
  phone: string;
  website: string;
  /** The website's host, or the phone number when no website was given. */
  site: string;
  notes: string;
  source: string;
  status: CallStatus;
  status_label: string;
  prospect: number | null;
  call_notes: string;
  created_at: string;
  updated_at: string;
}

export async function getCalls(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<CallRequest>> {
  return handleResponse(await authedFetch(`/api/admin/seo/calls/${queryString(params)}`));
}

export async function getCall(id: number): Promise<CallRequest> {
  return handleResponse(await authedFetch(`/api/admin/seo/calls/${id}/`));
}

export async function updateCall(
  id: number,
  changes: Partial<Pick<CallRequest, 'status' | 'call_notes'>>,
): Promise<CallRequest> {
  return handleResponse(
    await authedFetch(`/api/admin/seo/calls/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }),
  );
}
