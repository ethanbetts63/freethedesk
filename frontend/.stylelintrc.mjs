import { stylelintBaseConfig } from '../../freetheplatform/frontend/lint/stylelint-base.mjs';
import {
  freethedeskDisallowedValues,
  freethedeskShadowAllowedList,
} from '../../freetheplatform/frontend/lint/freethedesk-stylelint.mjs';

/**
 * CSS is the half of this codebase ESLint cannot see.
 *
 * The rule set itself is now imported rather than kept here: the canonical
 * source is freetheplatform/frontend/lint/stylelint-base.mjs, which allbikes
 * reads too, so the two sites cannot drift into disagreeing about what a token
 * is for. What stays local is what is genuinely site-specific - which files are
 * exceptions, and the four rules below that guard freethedesk's own foundation.
 *
 * The migration backlogs are clear: every rule is an error and `npm run check`
 * is warning-free. The breakpoint list now comes straight from the shared base,
 * which has no 900px or 1080px in it - Phase 4 converted the last consumers.
 */

/** Stylesheets that survive Phase 4 as approved artwork exceptions. */
const ARTWORK_EXCEPTIONS = [
  'src/components/visuals/FlowCardVisual.module.css',
  'src/app/licensing/_components/flowCompare.module.css',
];

export default {
  ...stylelintBaseConfig,

  ignoreFiles: [
    '**/node_modules/**',
    '.next/**',
    // A live preview of a *generated customer website* - a different design
    // system that happens to live in this repo, drawn inside `.browser` and
    // sized by its own --demo-text-* scale. Holding it to freethedesk's tokens
    // would be wrong, not just noisy. Still two thirds of all the CSS here.
    'src/app/dealership-website-builder/_styles/**',
  ],

  rules: {
    ...stylelintBaseConfig.rules,

    /* ------------------------------------------------------------------
       5. Shadows come from the elevation and ring scales.

       The CSS-side half of the ESLint rule against arbitrary `shadow-[...]`.
       There is one elevation vocabulary (--elevation-*) and one flat-ring
       vocabulary (--ring-focus, --ring-halo); a hand-written offset/blur/
       colour triple is a third scale nobody agreed to. Phase 4.13 collapsed
       six such shadows into two tokens - this is what stops a seventh.
       ------------------------------------------------------------------ */
    'declaration-property-value-allowed-list': freethedeskShadowAllowedList,

    /* ------------------------------------------------------------------
       6 and 7. Tints are named rather than re-mixed, and the palette is the
       foundation's vocabulary rather than a route's.
       ------------------------------------------------------------------ */
    'declaration-property-value-disallowed-list': freethedeskDisallowedValues(),
  },

  overrides: [
    {
      // styles/ defines the semantic tokens in terms of the ramps and mixes the
      // tints in the first place, so both of those rules are lifted here - but
      // the grid-track rule is restated, because an override REPLACES a rule's
      // options rather than merging them.
      files: ['src/styles/*.css'],
      rules: { 'declaration-property-value-disallowed-list': freethedeskDisallowedValues([]) },
    },
    {
      /* --------------------------------------------------------------
         8. A global foundation file styles elements and tokens.

         base.css and tokens.css are the document's defaults. A selector
         that *leads* with a class is a component, and a component's rules
         belong beside it. `main:has(.service-scroll)` stays legal: it
         styles an element and only names the class as a condition.

         layout.css, forms.css, motion.css and prose.css are exempt on
         purpose - defining .site-shell, .form-control, .moving-colour-*
         and .prose is precisely their job.
         -------------------------------------------------------------- */
      files: ['src/styles/base.css', 'src/styles/tokens.css'],
      rules: {
        'selector-disallowed-list': [
          [/^\./],
          {
            message:
              'A component selector belongs beside its component, not in a global foundation ' +
              'file. base.css and tokens.css style elements and define tokens.',
          },
        ],
      },
    },
    {
      /* --------------------------------------------------------------
         Artwork exceptions (lint-rules.md, "Allowed handwritten CSS"):
         FlowCardVisual's connectors and FlowCompare's gradient border are
         drawn, not laid out. Both sit on a dark surface the semantic
         tokens do not describe, and both carry their reasoning in the
         stylesheet header. The scale rules still apply to them; only the
         palette and the shadow shape are excused.
         -------------------------------------------------------------- */
      files: ARTWORK_EXCEPTIONS,
      rules: {
        'declaration-property-value-allowed-list': null,
        'declaration-property-value-disallowed-list': freethedeskDisallowedValues([]),
      },
    },
  ],
};
