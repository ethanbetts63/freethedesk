"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { getMessages, type AdminMessage } from "@/lib/adminApi";
import type { AccountBase, StaffAccountFields } from "@/lib/api";

type StaffAccount = AccountBase & StaffAccountFields;

interface Options<Account extends StaffAccount> {
  id: number;

  fetch: (id: number) => Promise<Account>;

  update: (id: number, changes: Partial<Pick<Account, "status" | "staff_notes">>) => Promise<Account>;

  messageFilter: "related_dealer" | "related_seo_subscriber";

  replySubject: string;

  loadError: string;
  saveError: string;
}

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

  /* Callers build the options object inline, so `fetch` and `loadError` are new
     values on every render. Only `id` and `messageFilter` identify the request,
     so the rest is read through a ref - that keeps the effect from re-running
     on each render without asking every call site to memoise its callbacks. */
  const latest = useRef({ fetch, loadError });
  useEffect(() => {
    latest.current = { fetch, loadError };
  });

  useEffect(() => {
    let active = true;
    Promise.all([latest.current.fetch(id), getMessages({ [messageFilter]: id, page_size: 20 })])
      .then(([result, messagePage]) => {
        if (!active) return;
        setAccount(result);
        setNotes(result.staff_notes);
        setMessages(messagePage.results);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : latest.current.loadError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, messageFilter]);

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
