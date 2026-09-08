"use client";

import { useEffect, useMemo, useState } from "react";

import { getMessages, type AdminMessage } from "@/lib/adminApi";
import type { AccountBase, StaffAccountFields } from "@/lib/api";

type StaffAccount = AccountBase & StaffAccountFields;

interface Options<Account extends StaffAccount> {
  id: number;
  /** Loads the account itself. */
  fetch: (id: number) => Promise<Account>;
  /** Applies a staff change and returns the updated account. */
  update: (id: number, changes: Partial<Pick<Account, "status" | "staff_notes">>) => Promise<Account>;
  /** Which admin-message filter links messages to this account. */
  messageFilter: "related_dealer" | "related_seo_subscriber";
  /** Subject line for the "email this account" composer link. */
  replySubject: string;
  /** Shown when the initial load fails, and when a save fails. */
  loadError: string;
  saveError: string;
}

/**
 * The shared state behind both admin account detail pages: load the account and
 * its recent messages, edit staff notes, change status, and build the composer
 * link. Only the copy and the two API functions differ between dealers and SEO
 * customers.
 */
export function useAccountDetail<Account extends StaffAccount>({
  id,
  fetch,
  update,
  messageFilter,
  replySubject,
  loadError,
  saveError,
}: Options<Account>) {
  const [account, setAccount] = useState<Account | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([fetch(id), getMessages({ [messageFilter]: id, page_size: 20 })])
      .then(([result, messagePage]) => {
        if (!active) return;
        setAccount(result);
        setNotes(result.staff_notes);
        setMessages(messagePage.results);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : loadError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const replyHref = useMemo(() => {
    if (!account) return "/dashboard/messages/compose";
    const firstName = account.contact_name.trim().split(/\s+/)[0] || account.contact_name;
    const params = new URLSearchParams({
      to: account.email,
      subject: replySubject,
      body: `Hi ${firstName},\n\n`,
    });
    return `/dashboard/messages/compose?${params}`;
  }, [account, replySubject]);

  async function save(changes: Partial<Pick<Account, "status" | "staff_notes">>, message: string) {
    if (!account) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      setAccount(await update(account.id, changes));
      setNotice(message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : saveError);
    } finally {
      setSaving(false);
    }
  }

  return { account, messages, notes, setNotes, loading, saving, notice, error, replyHref, save };
}
