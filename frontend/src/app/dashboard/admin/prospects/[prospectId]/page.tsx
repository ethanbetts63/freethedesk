'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import {
  AccountDetailHeader,
  DetailCard,
  RelatedMessagesCard,
} from '@/components/dashboard/AccountDetail';
import { StatusPill } from '@/components/dashboard/StatusPill';
import {
  REPORT_PROSPECT_TYPE,
  formatDateTime,
  getMessages,
  getReportProspect,
  unsubscribeReportProspect,
  updateReportProspect,
  type AdminMessage,
  type ProspectReply,
  type ReportProspect,
} from '@/lib/adminApi';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import {
  cardClassName,
  cardLinkClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
} from '@/components/ui/Card';
import { formControlClassName } from '@/components/ui/formControl';
import { backClassName, pageClassName } from '@/components/ui/layout';
import { cn } from '@/lib/utils';

const REPLY_CHOICES: { value: ProspectReply; label: string }[] = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'none', label: 'No reply' },
];

/**
 * One business sent a prospect report: who to call, what the report found, the
 * email exactly as it goes out, and the call. The call, its notes and any reply
 * are recorded here by hand, because they happen on the phone and in the inbox.
 */
export default function ReportProspectDetailPage() {
  const id = Number(useParams<{ prospectId: string }>().prospectId);
  const [prospect, setProspect] = useState<ReportProspect | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [callNotes, setCallNotes] = useState('');
  const [excludedReason, setExcludedReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      getReportProspect(id),
      getMessages({ related_type: REPORT_PROSPECT_TYPE, related_id: id, page_size: 20 }),
    ])
      .then(([result, messagePage]) => {
        if (!active) return;
        setProspect(result);
        setCallNotes(result.call_notes);
        setExcludedReason(result.excluded_reason);
        setMessages(messagePage.results);
      })
      .catch((reason) => {
        if (active)
          setError(reason instanceof Error ? reason.message : 'Prospect could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const replyHref = useMemo(() => {
    if (!prospect) return '/dashboard/admin/messages/compose';
    const params = new URLSearchParams({
      to: prospect.email,
      subject: `Re: ${prospect.subject}`,
      body: `Hi ${prospect.contact_name.split(' ')[0] || 'there'},\n\n`,
    });
    return `/dashboard/admin/messages/compose?${params}`;
  }, [prospect]);

  async function apply(work: () => Promise<ReportProspect>, message: string) {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const next = await work();
      setProspect(next);
      setCallNotes(next.call_notes);
      setExcludedReason(next.excluded_reason);
      setNotice(message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The prospect could not be updated.');
    } finally {
      setSaving(false);
    }
  }

  function unsubscribe() {
    if (!prospect) return;
    if (
      !confirm(
        `Put ${prospect.email} on the suppression list? Nothing will be sent to it again, from any part of the site.`,
      )
    )
      return;
    void apply(() => unsubscribeReportProspect(prospect.id), 'Address suppressed.');
  }

  async function copyPath() {
    if (!prospect) return;
    try {
      await navigator.clipboard.writeText(prospect.report_path);
      setNotice('Report path copied.');
    } catch {
      setError('The path could not be copied; select it instead.');
    }
  }

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading prospect…</p>
      </div>
    );
  if (error && !prospect)
    return (
      <div className={pageClassName}>
        <Link className={backClassName} href="/dashboard/admin/prospects">
          ← Prospects
        </Link>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  if (!prospect) return null;

  return (
    <div className={pageClassName}>
      <AccountDetailHeader
        backHref="/dashboard/admin/prospects"
        backLabel="Back to prospects"
        kicker={`Prospect #${prospect.id} · report ${prospect.report_version}`}
        title={prospect.business}
        subtitle={prospect.overview}
        actionHref={replyHref}
        actionLabel="Email them →"
      />

      {error && <Notice tone="danger">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}

      <div className={detailGridClassName}>
        <DetailCard
          title="Who to call"
          rows={[
            ['Name', prospect.contact_name || 'Not named on the site'],
            [
              'Phone',
              prospect.phone ? (
                <a className={cardLinkClassName} key="phone" href={`tel:${prospect.phone}`}>
                  {prospect.phone}
                </a>
              ) : (
                'None found'
              ),
            ],
            [
              'Email',
              <a className={cardLinkClassName} key="email" href={`mailto:${prospect.email}`}>
                {prospect.email}
              </a>,
            ],
            [
              'Website',
              <a
                className={cardLinkClassName}
                key="site"
                href={`https://${prospect.domain}`}
                target="_blank"
                rel="noreferrer"
              >
                {prospect.domain}
              </a>,
            ],
          ]}
        />

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>The call</h2>
          <p className="mb-s text-body-sm">
            {prospect.called_at
              ? `Called ${formatDateTime(prospect.called_at)}.`
              : 'Not called yet.'}
          </p>
          <div className="mb-m flex flex-wrap gap-xs">
            <Button
              variant="primary"
              disabled={saving}
              onClick={() =>
                apply(
                  () => updateReportProspect(prospect.id, { called_at: new Date().toISOString() }),
                  'Marked called.',
                )
              }
            >
              {prospect.called_at ? 'Called again now' : 'Mark called'}
            </Button>
            {prospect.called_at && (
              <Button
                variant="quiet"
                disabled={saving}
                onClick={() =>
                  apply(
                    () => updateReportProspect(prospect.id, { called_at: null }),
                    'Back on the list to call.',
                  )
                }
              >
                Not called
              </Button>
            )}
          </div>
          <textarea
            className={cn(formControlClassName, 'min-h-[6rem] p-s')}
            value={callNotes}
            maxLength={2000}
            onChange={(event) => setCallNotes(event.target.value)}
            aria-label="Notes from the call"
            placeholder="What was said, and what happens next."
          />
          <div className="mt-s">
            <Button
              variant="secondary"
              disabled={saving || callNotes === prospect.call_notes}
              onClick={() =>
                apply(
                  () => updateReportProspect(prospect.id, { call_notes: callNotes.trim() }),
                  'Notes saved.',
                )
              }
            >
              Save notes
            </Button>
          </div>
        </section>

        <DetailCard
          title="Report"
          rows={[
            ['Emailed', <StatusPill key="status" status={prospect.status} />],
            ['Sent', prospect.sent_at ? formatDateTime(prospect.sent_at) : 'Queued'],
            ['Subject line', prospect.subject_label],
            ['Paid searches', prospect.paid_searches.join(', ') || 'None recorded'],
            [
              'Path',
              <span key="path" className="break-all">
                {prospect.report_path}{' '}
                <button type="button" className={cardLinkClassName} onClick={copyPath}>
                  Copy
                </button>
              </span>,
            ],
          ]}
        />

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>What the report found</h2>
          <ul className="m-0 grid gap-2xs pl-m text-body-sm">
            {prospect.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </section>

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Record the reply</h2>
          <p className="mb-s text-body-sm text-text-muted">
            Replies arrive in the inbox. Mark them here so the five subject lines can be compared.
          </p>
          <div className="flex flex-wrap gap-xs">
            {REPLY_CHOICES.map((choice) => (
              <Button
                key={choice.value}
                variant={prospect.reply === choice.value ? 'primary' : 'secondary'}
                disabled={saving || prospect.reply === choice.value}
                onClick={() =>
                  apply(
                    () => updateReportProspect(prospect.id, { reply: choice.value }),
                    `Reply recorded as ${choice.label.toLowerCase()}.`,
                  )
                }
              >
                {choice.label}
              </Button>
            ))}
          </div>
          <p className="mt-m mb-xs text-body-sm text-text-muted">
            The email asks for a &ldquo;no thanks&rdquo; reply instead of a link, so suppress the
            address here when one comes.
          </p>
          <Button variant="quiet" disabled={saving} onClick={unsubscribe}>
            Unsubscribe this address
          </Button>
        </section>

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Hold back</h2>
          <p className="mb-s text-body-sm text-text-muted">
            A reason here keeps the email from going. Clear it to put it back in the queue.
          </p>
          <textarea
            className={cn(formControlClassName, 'min-h-[5rem] p-s')}
            value={excludedReason}
            maxLength={2000}
            onChange={(event) => setExcludedReason(event.target.value)}
            aria-label="Reason for holding this email back"
          />
          <div className="mt-s">
            <Button
              variant="secondary"
              disabled={saving || excludedReason === prospect.excluded_reason}
              onClick={() =>
                apply(
                  () =>
                    updateReportProspect(prospect.id, { excluded_reason: excludedReason.trim() }),
                  excludedReason.trim() ? 'Held back.' : 'Back in the queue.',
                )
              }
            >
              Save
            </Button>
          </div>
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>The email</h2>
          <p className="mb-s font-heavy">{prospect.subject}</p>
          <p className="m-0 whitespace-pre-line text-body-sm">{prospect.body}</p>
        </section>

        <RelatedMessagesCard
          messages={messages}
          replyHref={replyHref}
          emptyLabel="Nothing sent yet. The hourly run emails it in business hours."
        />
      </div>
    </div>
  );
}
