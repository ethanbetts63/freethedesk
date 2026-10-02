'use client';

import { AiReadinessBanner } from './AiReadinessBanner';
import { PromptDialog } from './PromptDialog';

export function AiReadinessDialog({ onClose }: { onClose: () => void }) {
  return (
    // AiReadinessModal only ever mounts this below `sm`, where the inline
    // banner is suppressed; `sm:hidden` is the belt to that braces, so a
    // viewport widened while the dialog is open cannot show both at once.
    <PromptDialog onClose={onClose} labelledBy="ai-readiness-modal-title" className="sm:hidden">
      <AiReadinessBanner placement="dialog" titleId="ai-readiness-modal-title" />
    </PromptDialog>
  );
}
