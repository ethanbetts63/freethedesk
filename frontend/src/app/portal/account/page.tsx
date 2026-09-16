"use client";

import { useActionState, useEffect, useState } from "react";
import { getDealerAccount, type DealerAccount } from "@/lib/dealerApi";
import { DEALER_STATES } from "@/lib/dealerStates";
import { submitPortalAccount, type PortalAccountState } from "./PortalAccount.actions";

const initialState: PortalAccountState = { status: "idle" };

export default function PortalAccountPage() {
  const [loadedAccount, setLoadedAccount] = useState<DealerAccount | null>(null);
  const [form, setForm] = useState({
    business_name: "",
    contact_name: "",
    phone: "",
    state: "WA" as DealerAccount["state"],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [state, dispatch, saving] = useActionState(submitPortalAccount, initialState);

  useEffect(() => {
    getDealerAccount()
      .then((result) => {
        setLoadedAccount(result);
        setForm({
          business_name: result.business_name,
          contact_name: result.contact_name,
          phone: result.phone,
          state: result.state,
        });
      })
      .catch((reason) => setLoadError(reason instanceof Error ? reason.message : "Your account could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  // `form` already holds exactly what was just submitted, and `account` (below)
  // picks up the saved snapshot from `state` — nothing needs resyncing here.
  const account = state.status === "success" && state.account ? state.account : loadedAccount;
  const error = state.status === "error" ? state.error : loadError;
  const notice = state.status === "success" && !saving ? "Your details have been saved." : "";

  const dirty =
    account !== null &&
    (form.business_name !== account.business_name ||
      form.contact_name !== account.contact_name ||
      form.phone !== account.phone ||
      form.state !== account.state);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(new FormData(event.currentTarget));
  };

  if (loading)
    return (
      <div className="admin-page">
        <p className="admin-empty">Loading your account…</p>
      </div>
    );
  if (error && !account)
    return (
      <div className="admin-page">
        <p className="admin-banner admin-banner-error">{error}</p>
      </div>
    );
  if (!account) return null;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Dealer portal</p>
          <h1>Account details</h1>
        </div>
      </header>

      {error && <p className="admin-banner admin-banner-error">{error}</p>}
      {notice && <p className="admin-banner">{notice}</p>}

      <div className="admin-detail-grid">
        <section className="admin-detail-card admin-detail-wide">
          <h2>Your dealership</h2>
          <form className="admin-compose-form" onSubmit={onSubmit}>
            <label>
              Business name
              <input
                name="business_name"
                value={form.business_name}
                onChange={(event) => setForm({ ...form, business_name: event.target.value })}
                required
              />
            </label>
            <label>
              Contact name
              <input
                name="contact_name"
                value={form.contact_name}
                onChange={(event) => setForm({ ...form, contact_name: event.target.value })}
                required
              />
            </label>
            <label>
              Phone
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </label>
            <label>
              State or territory
              <select
                name="state"
                value={form.state}
                onChange={(event) => setForm({ ...form, state: event.target.value as DealerAccount["state"] })}
              >
                {DEALER_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Email
              <input value={account.email} disabled />
              <small className="field-hint">
                This is your sign-in address. To change it, email hello@freethedesk.com.au and we will move it across.
              </small>
            </label>
            <button type="submit" className="admin-primary-button" disabled={saving || !dirty}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
