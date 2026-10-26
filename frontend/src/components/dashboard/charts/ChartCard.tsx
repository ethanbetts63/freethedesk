'use client';

import { Table2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

export interface ChartTable {
  columns: string[];
  rows: { label: string; cells: string[] }[];
}

/**
 * The frame every chart sits in, from allbikes' admin statistics: title, one-line
 * description, and a switch to the same figures as a table. The table is how every
 * value stays reachable without hovering.
 */
export function ChartCard({
  title,
  description,
  table,
  className,
  children,
}: {
  title: string;
  description?: string;
  table?: ChartTable;
  className?: string;
  children: ReactNode;
}) {
  const [asTable, setAsTable] = useState(false);

  return (
    <section
      className={cn('rounded-md border border-border-default bg-surface-page p-l', className)}
    >
      <div className="mb-s flex items-start justify-between gap-s">
        <div>
          <h3 className="m-0 text-body font-strong text-text-primary">{title}</h3>
          {description && (
            <p className="m-0 mt-4xs text-body-sm text-text-secondary">{description}</p>
          )}
        </div>
        {table && (
          <button
            type="button"
            onClick={() => setAsTable((value) => !value)}
            aria-pressed={asTable}
            className={cn(
              'flex shrink-0 cursor-pointer items-center gap-4xs rounded-sm border-0 bg-transparent p-0 text-body-sm text-text-secondary underline-offset-2 hover:text-text-primary hover:underline',
              focusRingClassName,
            )}
          >
            <Table2 className="size-[16px]" aria-hidden="true" />
            {asTable ? 'Chart' : 'Table'}
          </button>
        )}
      </div>
      {asTable && table ? (
        <div className="max-h-[320px] overflow-auto">
          <table className="w-full border-collapse text-body-sm">
            <thead className="sticky top-0 bg-surface-page">
              <tr className="border-b border-border-default text-left text-text-secondary">
                <th className="py-2xs pr-s font-strong">Month</th>
                {table.columns.map((column) => (
                  <th key={column} className="py-2xs pr-s text-right font-strong">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...table.rows].reverse().map((row) => (
                <tr key={row.label} className="border-b border-border-default last:border-0">
                  <td className="py-2xs pr-s text-text-primary">{row.label}</td>
                  {row.cells.map((cell, index) => (
                    <td
                      key={table.columns[index]}
                      className="py-2xs pr-s text-right text-text-primary tabular-nums"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}
