#!/usr/bin/env node
/**
 * Thin entry point. The engine is shared and byte-identical across the three
 * repos — edit it in `freetheplatform/frontend/registry/tooling/forms/` and
 * re-sync, never here.
 *
 * The ledger below is the repo-specific part and is the whole point: a new
 * form cannot be added without a row saying which track it is on, and a row
 * saying `excluded` cannot be added without a reason. See
 * `../../freetheplatform/_docs/forms-standard.md` for the tracks and
 * `../../_docs/forms-migration.md` for what is still outstanding.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkFormLedger } from './forms/form-ledger.mjs';
import { checkFormHygiene } from './forms/form-hygiene.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

checkFormLedger({
  root,
  ledger: [
    // Track A — react-hook-form + a Zod resolver.
    { file: 'app/portal/sales/new/page.tsx', track: 'A' },
    { file: 'app/portal/sales/[reference]/SaleDetailsForm.tsx', track: 'A' },
    { file: 'app/sale/_components/SaleFill.tsx', track: 'A' },

    // Track B — useActionState + a Server Action validating the same schema.
    { file: 'app/change-password/page.tsx', track: 'B' },
    { file: 'app/dashboard/admin/messages/compose/page.tsx', track: 'B' },
    { file: 'app/dashboard/admin/settings/site/page.tsx', track: 'B' },
    { file: 'app/dashboard/admin/users/[userId]/AccountForm.tsx', track: 'B' },
    { file: 'app/dashboard/admin/users/[userId]/SetPasswordForm.tsx', track: 'B' },
    { file: 'app/dealership-website-builder/_components/ConfiguratorControls.tsx', track: 'B' },
    { file: 'app/login/page.tsx', track: 'B' },
    { file: 'app/portal/account/page.tsx', track: 'B' },
    { file: 'app/portal/setup/page.tsx', track: 'B' },
    { file: 'app/portal/setup/_components/TradingDetails.tsx', track: 'B' },
    { file: 'app/reset-password/page.tsx', track: 'B' },
    { file: 'app/reset-password/[uid]/[token]/page.tsx', track: 'B' },
    { file: 'app/seo-portal/account/page.tsx', track: 'B' },
    { file: 'app/seo-portal/connect/page.tsx', track: 'B' },
    { file: 'components/marketing/AiReadinessForm.tsx', track: 'B' },

    // Excluded, with the argument. Re-opening one means disagreeing with the
    // reason, not noticing a gap.
    {
      file: 'app/portal/setup/_components/SpecialConditions.tsx',
      track: 'excluded',
      why: 'Track A on useFieldArray, deliberately unvalidated: a dealer’s own clauses are never reviewed or commented on (licensing/open-questions.md Q2).',
    },
    {
      file: 'components/forms/SelectionFormPanel.tsx',
      track: 'excluded',
      why: 'Presentational {chooser, children, onSubmit} wrapper. Holds the <form> for SignupPlansPanel, ProjectEnquiryPanel and SeoSignupPanel, whose schemas and actions sit beside those panels.',
    },
    {
      file: 'components/checkout/CheckoutShell.tsx',
      track: 'excluded',
      why: 'Stripe. The standard excludes payment forms by name.',
    },
    {
      file: 'components/dashboard/AdminList.tsx',
      track: 'excluded',
      why: 'Filter/search (AdminFilterBar), no network write.',
    },
    {
      file: 'app/dealership-website-builder/_components/previews/ContactPage.tsx',
      track: 'excluded',
      why: 'Configurator preview of a generated customer site. Submits nowhere.',
    },
    {
      file: 'app/dealership-website-builder/_components/previews/HirePage.tsx',
      track: 'excluded',
      why: 'Configurator preview. Submits nowhere.',
    },
    {
      file: 'app/dealership-website-builder/_components/previews/InventoryPage.tsx',
      track: 'excluded',
      why: 'Configurator preview. Submits nowhere.',
    },
    {
      file: 'app/dealership-website-builder/_components/previews/VehicleDetailsPage.tsx',
      track: 'excluded',
      why: 'Configurator preview. Submits nowhere.',
    },
    {
      file: 'app/dealership-website-builder/_components/previews/shared.tsx',
      track: 'excluded',
      why: 'Configurator preview building blocks. Submits nowhere.',
    },
  ],
});

checkFormHygiene({
  root,
  sessionCookies: ['freethedesk_access', 'freethedesk_refresh'],
  envReaders: [
    {
      file: 'lib/serverApi.ts',
      why: 'Owns SERVER_API_BASE_URL and the 127.0.0.1 fallback.',
    },
  ],
});
