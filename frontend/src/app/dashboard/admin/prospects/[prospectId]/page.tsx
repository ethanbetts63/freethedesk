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
import { adminTdClassName, adminThClassName } from '@/components/dashboard/AdminList';
import {
  REPORT_PROSPECT_TYPE,
  formatDateTime,
  getMessages,
  getReportProspect,
  type AdminMessage,
  type ProspectView,
  type ReportProspectDetail,
} from '@/lib/adminApi';
import { Notice } from '@/components/ui/Notice';
import {
  cardClassName,
  cardLinkClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
} from '@/components/ui/Card';
import { backClassName, pageClassName } from '@/components/ui/layout';
import { cn } from '@/lib/utils';

/** Where a view came from: the link's `?s=`, or for a click on to /seo, where on the page it was. */
const SOURCE_LABELS: Record<string, string> = {
  email: 'Report email',
  'follow-up': 'Follow-up email',
  text: 'Text',
  dashboard: 'Dashboard copy',
  bar: 'Strip at the top',
  report: "The report's own link",
  ask: 'Ask band at the bottom',
};

/** Every logged view of the report, newest first, each saying whether the counts take it. */
function ViewsCard({ views }: { views: ProspectView[] }) {
  return (
    <section className={cn(cardClassName, cardWideClassName)}>
      <h2 className={cardTitleClassName}>Every view</h2>
      <p className="mb-s text-body-sm text-text-muted">
        Only views after the email went, by people, are counted above. Your own views while signed
        in are never logged.
      </p>
      {views.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                <th className={adminThClassName}>When</th>
                <th className={adminThClassName}>What</th>
                <th className={adminThClassName}>From</th>
                <th className={adminThClassName}>Device</th>
                <th className={adminThClassName}>Counted</th>
              </tr>
            </thead>
            <tbody>
              {views.map((view) => (
                <tr key={view.id} className={view.not_counted ? 'opacity-60' : undefined}>
                  <td className={cn(adminTdClassName, 'whitespace-nowrap')}>
                    {formatDateTime(view.at)}
                  </td>
                  <td className={adminTdClassName}>
                    {view.kind === 'seo' ? 'Clicked on to /seo' : view.kind_label}
                  </td>
                  <td className={adminTdClassName}>
                    {SOURCE_LABELS[view.source] ?? (view.source || 'No tag')}
                  </td>
                  <td className={adminTdClassName} title={view.user_agent || undefined}>
                    {view.device}
                  </td>
                  <td className={adminTdClassName}>
                    {view.not_counted ? `No: ${view.not_counted}` : 'Yes'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-label text-text-subtle">No views logged yet.</p>
      )}
    </section>
  );
}

/**
 * One business sent a prospect report: who to call, the report and every view
 * of it, and the email exactly as it goes out.
 */
export default function ReportProspectDetailPage() {
  const id = Number(useParams<{ prospectId: string }>().prospectId);
  const [prospect, setProspect] = useState<ReportProspectDetail | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
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

  async function copyPath() {
    if (!prospect) return;
    try {
      await navigator.clipboard.writeText(prospect.report_path);
      setNotice('Report path copied.');
    } catch {
      setError('The path could not be copied; select it instead.');
    }
  }

  async function copyLink() {
    if (!prospect) return;
    try {
      await navigator.clipboard.writeText(prospect.report_link);
      setNotice('Report link copied.');
    } catch {
      setError('The link could not be copied; select it instead.');
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

        <DetailCard
          title="Report"
          rows={[
            ['Emailed', <StatusPill key="status" status={prospect.status} />],
            ['Sent', prospect.sent_at ? formatDateTime(prospect.sent_at) : 'Queued'],
            ['Subject line', prospect.subject_label],
            ['Paid searches', prospect.paid_searches.join(', ') || 'None recorded'],
            [
              'Link',
              <span key="link" className="break-all">
                <a
                  className={cardLinkClassName}
                  href={`${prospect.report_link}?s=dashboard`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {prospect.report_link}
                </a>{' '}
                <button type="button" className={cardLinkClassName} onClick={copyLink}>
                  Copy
                </button>
              </span>,
            ],
            [
              'Opened',
              prospect.opens
                ? `${prospect.opens} ${prospect.opens === 1 ? 'time' : 'times'}, last ${formatDateTime(prospect.last_opened_at ?? '')}`
                : 'Not yet',
            ],
            [
              'On to /seo',
              prospect.seo_clicks
                ? `${prospect.seo_clicks} ${prospect.seo_clicks === 1 ? 'click' : 'clicks'}`
                : 'Not yet',
            ],
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

        <ViewsCard views={prospect.views} />

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>The email</h2>
          <p className="mb-2xs font-heavy">{prospect.subject}</p>
          <p className="mb-s text-body-sm text-text-subtle">
            Subject {prospect.subject_version}, body {prospect.body_version}:{' '}
            {prospect.body_label.replace(/^\d: /, '')}
          </p>
          <p className="m-0 whitespace-pre-line text-body-sm">{prospect.email_body}</p>
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
