'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import {
  PortalCheckbox,
  PortalField,
  PortalFieldset,
  portalFormActionsClassName,
  portalFormClassName,
} from '@/components/dashboard/PortalField';
import {
  getSpecialConditions,
  saveSpecialConditions,
  type SpecialConditions as Conditions,
} from '@/lib/dealerApi';

/**
 * Per-clause approval, and the part of this screen with the most care in it.
 *
 * Three rules it carries, from `_docs/licensing/open-questions.md` Q2:
 *
 * - **SC2 and SC6 cannot be removed**, and the reason shown says so plainly.
 *   Without the authority to lodge and the consent to sign electronically the
 *   product does not function. That is a statement about the product, not
 *   advice about their business.
 * - **Their additions are never reviewed, validated or commented on.** No
 *   suggestions, no warnings, no "you might also want".
 * - **No clause library.** There is nothing to browse. They read the defaults
 *   and they write their own.
 *
 * Track A, on `useFieldArray` alone: the additions are a repeatable group.
 */
interface FormValues {
  additions: { heading: string; paragraphs: string }[];
}

/** The API holds paragraphs as a list; a dealer types them as a textarea. */
function toText(paragraphs: string[]) {
  return paragraphs.join('\n\n');
}

function toParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function SpecialConditions() {
  const [conditions, setConditions] = useState<Conditions | null>(null);
  const [kept, setKept] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const { control, register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { additions: [] },
  });
  const additions = useFieldArray({ control, name: 'additions' });

  useEffect(() => {
    let active = true;
    getSpecialConditions()
      .then((result) => {
        if (!active) return;
        setConditions(result);
        setKept(Object.fromEntries(result.conditions.map((row) => [row.number, row.kept])));
        reset({
          additions: result.additions.map((entry) => ({
            heading: entry.heading,
            paragraphs: toText(entry.paragraphs),
          })),
        });
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error ? reason.message : 'Special conditions could not be loaded.',
          );
      });
    return () => {
      active = false;
    };
  }, [reset]);

  async function save(values: FormValues) {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await saveSpecialConditions({
        defaults: kept,
        additions: values.additions
          .map((entry) => ({
            heading: entry.heading.trim(),
            paragraphs: toParagraphs(entry.paragraphs),
          }))
          .filter((entry) => entry.heading && entry.paragraphs.length),
      });
      setConditions(result);
      setNotice('Saved. Your choices are recorded against today’s date.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your choices could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  if (!conditions)
    return error ? (
      <Notice tone="danger">{error}</Notice>
    ) : (
      <p className="text-text-subtle">Loading special conditions…</p>
    );

  return (
    <form className={portalFormClassName} onSubmit={handleSubmit(save)} noValidate>
      {error && <Notice tone="danger">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}

      <PortalFieldset
        disabled={saving}
        legend="The standard conditions"
        description="These print on the face of your Vehicle Sale Contract. Read each one and keep or remove it. They are drafted for the way this product works; the contract is yours."
      >
        <ol className="m-0 grid list-none gap-ml p-0">
          {conditions.conditions.map((condition) => (
            <li
              key={condition.number}
              className="rounded-sm border border-border-default bg-surface-tint p-m"
            >
              <h3 className="m-0 text-body font-heavy">
                {condition.number} — {condition.heading}
              </h3>
              <p className="mt-2xs mb-s text-label text-text-subtle">{condition.applies}</p>
              {condition.paragraphs.map((paragraph, index) => (
                <p key={index} className="mt-xs mb-0 text-label leading-[1.6]">
                  {paragraph}
                </p>
              ))}
              {condition.alternative_paragraphs.length > 0 && (
                <>
                  <p className="mt-m mb-0 text-label font-heavy">
                    Where the purchaser is not the licence holder, this is printed instead:
                  </p>
                  {condition.alternative_paragraphs.map((paragraph, index) => (
                    <p key={index} className="mt-xs mb-0 text-label leading-[1.6]">
                      {paragraph}
                    </p>
                  ))}
                </>
              )}
              <div className="mt-m">
                {condition.removable ? (
                  <PortalCheckbox
                    label={`Include ${condition.number} in my contracts`}
                    checked={kept[condition.number] ?? true}
                    onChange={(event) =>
                      setKept((current) => ({
                        ...current,
                        [condition.number]: event.target.checked,
                      }))
                    }
                  />
                ) : (
                  <p className="m-0 text-caption text-text-muted">
                    <strong>Always included.</strong>{' '}
                    {condition.number === 'SC2'
                      ? 'This is what lets us lodge your customer’s application with the Department of Transport on their behalf.'
                      : 'This is what lets your customer sign and receive the contract electronically.'}{' '}
                    Without it this product cannot do the thing you are paying it for.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </PortalFieldset>

      <PortalFieldset
        disabled={saving}
        legend="Your own conditions"
        description="Anything you want to add, in your own words. We print them as written — we do not review them, and we cannot advise you on them."
      >
        <div className="grid gap-ml">
          {additions.fields.map((field, index) => (
            <div key={field.id} className="grid gap-s rounded-sm border border-border-default p-m">
              <PortalField
                label="Heading"
                placeholder="Card deposits"
                {...register(`additions.${index}.heading` as const)}
              />
              <PortalField
                label="Wording"
                multiline
                rows={4}
                hint="Leave a blank line between paragraphs."
                {...register(`additions.${index}.paragraphs` as const)}
              />
              <div>
                <Button variant="quiet" onClick={() => additions.remove(index)}>
                  Remove this condition
                </Button>
              </div>
            </div>
          ))}
          <div>
            <Button
              variant="secondary"
              onClick={() => additions.append({ heading: '', paragraphs: '' })}
            >
              Add a condition of your own
            </Button>
          </div>
        </div>
      </PortalFieldset>

      <p className="m-0 text-label text-text-muted">{conditions.statement}</p>

      <div className={portalFormActionsClassName}>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save my conditions'}
        </Button>
      </div>
    </form>
  );
}
