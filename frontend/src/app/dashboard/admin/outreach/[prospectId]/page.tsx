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
  PROSPECT_TYPE,
  formatDateTime,
  getMessages,
  getProspect,
  unsubscribeProspect,
  updateProspect,
  type AdminMessage,
  type Prospect,
  type ProspectReply,
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
import { formatDate } from '@/lib/formatting';
import { cn } from '@/lib/utils';

const REPLY_CHOICES: { value: ProspectReply; label: string }[] = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'none', label: 'No reply' },
];

function externalLink(href: string, label?: string) {
  return (
    <a className={cardLinkClassName} href={href} target="_blank" rel="noreferrer">
      {label ?? href}
    </a>
  );
}

/**
 * One prospect: the pitch they got and what came of it, the show the opener was
 * written from, and the messages. Replies are recorded here by hand, because
 * they land in the owner's inbox, not in the system.
 */
export default function ProspectDetailPage() {
  const id = Number(useParams<{ prospectId: string }>().prospectId);
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [excludedReason, setExcludedReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      getProspect(id),
      getMessages({ related_type: PROSPECT_TYPE, related_id: id, page_size: 20 }),
    ])
      .then(([result, messagePage]) => {
        if (!active) return;
        setProspect(result);
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
      subject: `Re: ${prospect.podcast_name}`,
      body: `Hi ${prospect.first_name || 'there'},\n\n`,
    });
    return `/dashboard/admin/messages/compose?${params}`;
  }, [prospect]);

  async function apply(work: () => Promise<Prospect>, message: string) {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const next = await work();
      setProspect(next);
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
    void apply(() => unsubscribeProspect(prospect.id), 'Address suppressed.');
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
        <Link className={backClassName} href="/dashboard/admin/outreach">
          ← Outreach
        </Link>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  if (!prospect) return null;

  return (
    <div className={pageClassName}>
      <AccountDetailHeader
        backHref="/dashboard/admin/outreach"
        backLabel="Back to outreach"
        kicker={`Prospect #${prospect.id} · version ${prospect.version_label}`}
        title={prospect.podcast_name}
        subtitle={`${prospect.host_name || 'Host unknown'} · added ${formatDateTime(prospect.created_at)}`}
        actionHref={replyHref}
        actionLabel="Email host →"
      />

      {error && <Notice tone="danger">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}

      <div className={detailGridClassName}>
        <DetailCard
          title="Pitch"
          rows={[
            ['Status', <StatusPill key="status" status={prospect.status} />],
            ['Version', prospect.version_label],
            ['Audience relevance', prospect.relevance_label || 'Not rated'],
            ['Pitched', prospect.pitched_at ? formatDateTime(prospect.pitched_at) : 'Queued'],
            ['Reply', prospect.reply_label],
            [
              'Signed up',
              prospect.affiliate ? (
                <Link
                  className={cardLinkClassName}
                  key="affiliate"
                  href={`/dashboard/admin/affiliates/${prospect.affiliate}`}
                >
                  {prospect.affiliate_name} →
                </Link>
              ) : (
                'No'
              ),
            ],
          ]}
        />

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Record the reply</h2>
          <p className="mb-s text-body-sm text-text-muted">
            Replies arrive in the inbox. Mark them here so the three versions can be compared.
          </p>
          <div className="flex flex-wrap gap-xs">
            {REPLY_CHOICES.map((choice) => (
              <Button
                key={choice.value}
                variant={prospect.reply === choice.value ? 'primary' : 'secondary'}
                disabled={saving || prospect.reply === choice.value}
                onClick={() =>
                  apply(
                    () => updateProspect(prospect.id, { reply: choice.value }),
                    `Reply recorded as ${choice.label.toLowerCase()}.`,
                  )
                }
              >
                {choice.label}
              </Button>
            ))}
          </div>
          <p className="mt-m mb-xs text-body-sm text-text-muted">
            A &ldquo;no thanks&rdquo; reply to version C has no link to click, so suppress the
            address here.
          </p>
          <Button variant="quiet" disabled={saving} onClick={unsubscribe}>
            Unsubscribe this address
          </Button>
        </section>

        <DetailCard
          title="Podcast"
          rows={[
            ['Host', prospect.host_name || 'Not in the feed'],
            [
              'Email',
              <a className={cardLinkClassName} key="email" href={`mailto:${prospect.email}`}>
                {prospect.email}
              </a>,
            ],
            ['Website', prospect.website ? externalLink(prospect.website) : 'None'],
            [
              'Apple Podcasts',
              prospect.apple_url ? externalLink(prospect.apple_url, 'Listing →') : 'None',
            ],
            ['Genre', prospect.genre || '—'],
            ['Episodes', String(prospect.episode_count)],
            [
              'Last release',
              prospect.last_release_date ? formatDate(prospect.last_release_date) : '—',
            ],
            ['Feed', externalLink(prospect.email_source, 'RSS →')],
            ['Scraped', formatDate(prospect.scraped_on)],
          ]}
        />

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Exclude</h2>
          <p className="mb-s text-body-sm text-text-muted">
            A reason here takes the prospect out of the queue. Clear it to put them back.
          </p>
          <textarea
            className={cn(formControlClassName, 'min-h-[5rem] p-s')}
            value={excludedReason}
            maxLength={2000}
            onChange={(event) => setExcludedReason(event.target.value)}
            aria-label="Reason for excluding this prospect"
          />
          <div className="mt-s">
            <Button
              variant="secondary"
              disabled={saving || excludedReason === prospect.excluded_reason}
              onClick={() =>
                apply(
                  () => updateProspect(prospect.id, { excluded_reason: excludedReason.trim() }),
                  excludedReason.trim() ? 'Prospect excluded.' : 'Prospect back in the queue.',
                )
              }
            >
              Save
            </Button>
          </div>
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>The episode the opener was written from</h2>
          <p className="mb-2xs font-heavy">
            {prospect.latest_episode_title || 'No title in the feed'}
          </p>
          <p className="mb-m whitespace-pre-line text-body-sm text-text-muted">
            {prospect.latest_episode_description || 'No description in the feed.'}
          </p>
          <h3 className="mb-2xs text-label text-text-subtle">Opener</h3>
          <p className="m-0 text-body-sm">
            {prospect.opener || (
              <span className="text-text-subtle">
                None. The pitch went without a second paragraph.
              </span>
            )}
          </p>
        </section>

        <RelatedMessagesCard
          messages={messages}
          replyHref={replyHref}
          emptyLabel="Nothing sent yet. The hourly cron will pitch this prospect in turn."
        />
      </div>
    </div>
  );
}
