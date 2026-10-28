'use client';

import { CheckCircle2, Paperclip } from 'lucide-react';
import { useRef, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

/**
 * The attachment block on the message composer and the invoice email: a picker button and the list
 * of what has been chosen so far, with each file removable.
 *
 * The chosen files live in the caller's state, not in the `<input>`: the input is cleared after
 * every pick so the same picker can add more. The files are read from the input *before* the state
 * update is queued, because a React updater function runs later, by which time the input is empty
 * again. (Reading them inside the updater is what used to make a pick silently add nothing.)
 */
export function AttachmentPicker({
  title,
  hint,
  files,
  onChange,
}: {
  title: ReactNode;
  hint: ReactNode;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-s rounded-sm border border-border-default bg-surface-tint p-m">
      <div>
        <strong className="block">{title}</strong>
        <small className="mt-3xs block text-label text-text-subtle">{hint}</small>
      </div>
      <Button variant="quiet" type="button" onClick={() => inputRef.current?.click()}>
        <Paperclip aria-hidden size={14} className="mr-2xs" />
        {files.length > 0 ? 'Attach more' : 'Attach files'}
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (picked.length > 0) onChange([...files, ...picked]);
        }}
      />
      {files.length > 0 && (
        <div className="col-[1/-1] border-t border-border-default pt-s">
          <p className="m-0 flex items-center gap-2xs text-label font-heavy text-text-success">
            <CheckCircle2 aria-hidden size={16} />
            {files.length === 1 ? '1 file attached' : `${files.length} files attached`}
          </p>
          <ul className="m-0 mt-2xs list-none p-0">
            {files.map((file, index) => (
              <li
                className="flex items-center justify-between gap-m border-t border-border-default py-xs text-body-sm first:border-t-0"
                key={`${file.name}-${file.size}-${index}`}
              >
                <span className="flex min-w-0 items-center gap-xs">
                  <Paperclip aria-hidden size={14} className="shrink-0 text-text-subtle" />
                  <span className="truncate font-heavy">{file.name}</span>
                  <span className="shrink-0 text-text-subtle">{formatFileSize(file.size)}</span>
                </span>
                <button
                  className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-label font-heavy text-text-danger underline"
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onChange(files.filter((_, current) => current !== index))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** `312 KB` or `2.4 MB`: a size someone can check against the attachment limit. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
