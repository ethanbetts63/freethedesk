'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiErrorMessage } from '@freetheplatform/web-security';

import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { backClassName, pageClassName } from '@/components/ui/layout';
import type { InvoiceFormInput } from '../_lib/InvoiceForm.schema';
import { getInvoiceConfig } from '../_lib/invoiceApi';
import type { InvoiceConfig, InvoiceInput, RelatedRecord } from '../_lib/invoiceTypes';
import InvoiceForm from './InvoiceForm';

interface Loaded {
  values: InvoiceFormInput;
  related: RelatedRecord | null;
}

/** The shell around the editor: load the config and the starting values, then hand over. */
export default function InvoiceEditorPage({
  title,
  backHref,
  submitLabel,
  load,
  save,
}: {
  title: string;
  backHref: string;
  submitLabel: string;
  load: (config: InvoiceConfig) => Promise<Loaded>;
  save: (input: InvoiceInput) => Promise<void>;
}) {
  const [config, setConfig] = useState<InvoiceConfig | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getInvoiceConfig()
      .then(async (nextConfig) => {
        const start = await load(nextConfig);
        if (cancelled) return;
        setConfig(nextConfig);
        setLoaded(start);
      })
      .catch((reason) => {
        if (!cancelled) setError(apiErrorMessage(reason, 'The invoice could not be loaded.'));
      });
    return () => {
      cancelled = true;
    };
    // Mount-only: a reload mid-edit would overwrite what the operator has typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (input: InvoiceInput) => {
    setError('');
    try {
      await save(input);
    } catch (reason) {
      setError(apiErrorMessage(reason, 'The invoice could not be saved.'));
    }
  };

  return (
    <div className={pageClassName}>
      <Link className={backClassName} href={backHref}>
        ← Back
      </Link>
      <PageHeader kicker="Billing" title={title} />
      {error && <Notice tone="danger">{error}</Notice>}
      {!config || !loaded ? (
        !error && <p className="text-text-subtle">Loading…</p>
      ) : (
        <InvoiceForm
          config={config}
          initialValues={loaded.values}
          initialRelated={loaded.related}
          submitLabel={submitLabel}
          onSubmit={submit}
        />
      )}
    </div>
  );
}
