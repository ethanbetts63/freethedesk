'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { formControlClassName, formControlPaddingClassName } from '@/components/ui/formControl';
import { cn } from '@/lib/utils';
import { searchInvoiceCustomers } from '../_lib/invoiceApi';
import type { CustomerCandidate } from '../_lib/invoiceTypes';

/**
 * Find the customer among enquiries, dealers, SEO customers and earlier invoices, and copy their
 * details in. Not its own form element: it sits inside the invoice form, and a nested one would
 * submit the invoice.
 */
export default function CustomerPicker({
  onPick,
}: {
  onPick: (candidate: CustomerCandidate) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerCandidate[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (query.trim().length < 2) {
      setError('Type at least two characters.');
      return;
    }
    setError('');
    setSearching(true);
    try {
      setResults(await searchInvoiceCustomers(query.trim()));
    } catch {
      setError('Search failed.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="rounded-sm border border-border-default bg-surface-tint p-m">
      <strong className="block text-body">Find a customer</strong>
      <small className="mt-3xs block text-label text-text-subtle">
        Name, business or email. Picking one copies their details and links the invoice to that
        record.
      </small>
      <div className="mt-s flex gap-2xs">
        <input
          className={cn(formControlClassName, formControlPaddingClassName)}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void search();
            }
          }}
          placeholder="e.g. Owner Motors, sam@example.com"
          aria-label="Search customers"
        />
        <Button variant="quiet" type="button" onClick={search} disabled={searching}>
          {searching ? 'Searching…' : 'Search'}
        </Button>
      </div>
      {error && (
        <Notice tone="danger" size="field">
          {error}
        </Notice>
      )}
      {results && results.length === 0 && (
        <p className="mt-s mb-0 text-label text-text-subtle">No matches. Type the details below.</p>
      )}
      {results && results.length > 0 && (
        <ul className="mt-s mb-0 list-none rounded-xs border border-border-default bg-surface-page p-0">
          {results.map((candidate, index) => (
            <li
              key={`${candidate.source}-${candidate.related?.id ?? index}`}
              className="border-b border-border-default last:border-b-0"
            >
              <button
                type="button"
                className="flex w-full cursor-pointer items-start justify-between gap-s border-0 bg-transparent px-s py-xs text-left hover:bg-surface-tint"
                onClick={() => {
                  onPick(candidate);
                  setResults(null);
                  setQuery('');
                }}
              >
                <span>
                  <span className="block text-body-sm font-heavy">{candidate.label}</span>
                  <span className="block text-label text-text-subtle">{candidate.detail}</span>
                </span>
                <span className="text-label text-text-subtle">{candidate.source}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
