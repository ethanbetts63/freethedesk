'use client';

import { useEffect, useState } from 'react';

import { cardClassName, cardTitleClassName, messageBodyClassName } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import { getSiteSettings, type PublicSiteSettings } from '@/lib/api';

import { CopyValue } from '../_components/CopyValue';
import { promotionPieces } from '../_lib/promotion';
import { useAffiliateAccount } from '../_lib/useAffiliateAccount';

export default function AffiliatePortalPromotePage() {
  const { account, error, loading } = useAffiliateAccount();
  const [settings, setSettings] = useState<PublicSiteSettings | null>(null);
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .catch((reason) =>
        setSettingsError(
          reason instanceof Error ? reason.message : 'The prices could not be loaded.',
        ),
      );
  }, []);

  if (loading || (!settings && !settingsError))
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading…</p>
      </div>
    );
  if ((error && !account) || (settingsError && !settings))
    return (
      <div className={pageClassName}>
        <Notice tone="danger">{error || settingsError}</Notice>
      </div>
    );
  if (!account || !settings) return null;

  const pieces = promotionPieces(account, settings);

  return (
    <div className={pageClassName}>
      <PageHeader
        title="Words for the show"
        subtitle="Written around your code and today's prices. Edit them for your show; keep them true."
      />

      <section className={cardClassName}>
        <h2 className={cardTitleClassName}>Your code and link</h2>
        <div className="flex flex-col gap-m">
          <CopyValue value={account.code} label="Copy code" />
          <CopyValue value={account.share_link} label="Copy link" />
        </div>
      </section>

      <div className="grid gap-ml">
        {pieces.map((piece) => (
          <section key={piece.title} className={cardClassName}>
            <h2 className={cardTitleClassName}>{piece.title}</h2>
            <p className={`${messageBodyClassName} mb-m text-text-subtle`}>{piece.note}</p>
            <CopyValue value={piece.text} label="Copy text" block />
          </section>
        ))}
      </div>
    </div>
  );
}
