import { authedFetch, jsonOrError, type DealerStatus } from "./api";

export interface DealerAccount {
  id: number;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: DealerStatus;
  status_label: string;
  created_at: string;
  updated_at: string;
}

export type DealerAccountChanges = Partial<Pick<DealerAccount, "business_name" | "contact_name" | "phone">>;

export async function getDealerAccount(): Promise<DealerAccount> {
  return jsonOrError(await authedFetch("/api/dealers/me/"));
}

export async function updateDealerAccount(changes: DealerAccountChanges): Promise<DealerAccount> {
  return jsonOrError(await authedFetch("/api/dealers/me/", {
    method: "PATCH",
    body: JSON.stringify(changes),
  }));
}
