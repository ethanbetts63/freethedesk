'use client';

import { useActionState, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import {
  PortalField,
  PortalFieldset,
  portalFieldGridClassName,
  portalFormActionsClassName,
  portalFormClassName,
} from '@/components/dashboard/PortalField';
import { getDealerTrading, type DealerTradingDetails } from '@/lib/dealerApi';
import { submitTradingDetails, type TradingDetailsState } from '../TradingDetails.actions';

const initialState: TradingDetailsState = { status: 'idle' };

export function TradingDetails() {
  const [loaded, setLoaded] = useState<DealerTradingDetails | null>(null);
  const [loadError, setLoadError] = useState('');
  const [state, dispatch, saving] = useActionState(submitTradingDetails, initialState);

  useEffect(() => {
    let active = true;
    getDealerTrading()
      .then((result) => {
        if (active) setLoaded(result);
      })
      .catch((reason) => {
        if (active)
          setLoadError(
            reason instanceof Error ? reason.message : 'Trading details could not be loaded.',
          );
      });
    return () => {
      active = false;
    };
  }, []);

  const details = state.status === 'success' && state.details ? state.details : loaded;
  const error = state.status === 'error' ? state.error : loadError;

  if (!details)
    return error ? (
      <Notice tone="danger">{error}</Notice>
    ) : (
      <p className="text-text-subtle">Loading trading details…</p>
    );

  return (
    <form className={portalFormClassName} action={dispatch}>
      {error && <Notice tone="danger">{error}</Notice>}
      {state.status === 'success' && <Notice tone="success">{state.notice}</Notice>}

      <PortalFieldset
        disabled={saving}
        legend="Bank details"
        description="Shown to your customer on their payment instructions and nowhere else. The money moves from them to you — we never see it."
      >
        <div className={portalFieldGridClassName}>
          <PortalField
            label="Account name"
            name="bank_account_name"
            defaultValue={details.bank_account_name}
          />
          <PortalField
            label="BSB"
            name="bank_bsb"
            inputMode="numeric"
            hint="Six digits. We show it to the customer as 036-004."
            defaultValue={details.bank_bsb}
          />
          <PortalField
            label="Account number"
            name="bank_account_number"
            inputMode="numeric"
            defaultValue={details.bank_account_number}
          />
        </div>
      </PortalFieldset>

      <PortalFieldset
        disabled={saving}
        legend="Your signature"
        description="How your side of a contract is signed when you approve a sale. The name is enough on its own — the image only changes what it looks like."
      >
        <div className={portalFieldGridClassName}>
          <PortalField
            label="Name to print"
            name="signature_name"
            hint="Used as “Electronically signed by …” when there is no image."
            defaultValue={details.signature_name}
          />
          <PortalField
            label="Signature image"
            name="signature_image"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            hint={
              details.signature_image_uploaded
                ? 'Already uploaded — choose a file only to replace it.'
                : 'Optional. PNG with a transparent background works best.'
            }
          />
        </div>
      </PortalFieldset>

      <PortalFieldset
        disabled={saving}
        legend="Trading hours"
        description="Shown to a customer at the end of a sale, in your own words. Free text — we do not turn it into a schedule."
      >
        <PortalField
          label="Anything the customer should know about reaching you"
          name="trading_hours_note"
          multiline
          rows={3}
          defaultValue={details.trading_hours_note}
        />
      </PortalFieldset>

      <div className={portalFormActionsClassName}>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save trading details'}
        </Button>
      </div>
    </form>
  );
}
