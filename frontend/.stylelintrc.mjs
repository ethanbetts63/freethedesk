/**
 * CSS is the half of this codebase ESLint cannot see.
 *
 * That blind spot is how tokens.css came to hold a type ramp and a space scale
 * that almost nothing used: font-size was 19% tokenised across 96 distinct
 * values and padding 5% across 174, while colour -- which no rule guarded
 * either, but which is harder to fudge -- sat at 96%. The rules below are the
 * ones that would have stopped that drift as it happened.
 *
 * The original migration backlogs are now clear, so every active rule blocks a
 * regression as an error and `npm run check` remains warning-free.
 */

/** Properties whose values must come from the scales in tokens.css. */
const TOKENISED = [
  "/^--/",
  "color",
  "background-color",
  "border-color",
  "font-size",
  "font-weight",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "gap",
  "row-gap",
  "column-gap",
  "border-radius",
];

/**
 * Values that are not design decisions and so need no token: layout identities,
 * CSS-wide keywords, and the two self-describing extremes of a radius.
 */
const NOT_A_DESIGN_DECISION = [
  "0",
  "auto",
  "none",
  "inherit",
  "initial",
  "revert",
  "unset",
  "transparent",
  "currentColor",
  "50%",
  "100%",
  "/^var\\(/",
];

export default {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-declaration-strict-value"],

  ignoreFiles: [
    "**/node_modules/**",
    ".next/**",
    // A live preview of a *generated customer website* -- a different design
    // system that happens to live in this repo. Holding it to freethedesk's
    // tokens would be wrong, not just noisy. 27% of all CSS here.
    "src/app/dealership-website-builder/_styles/**",
  ],

  rules: {
    // Tailwind v4's CSS-first config at-rules. stylelint-config-standard
    // doesn't know them yet. allbikes is consolidating this rule set (and the
    // matching ESLint design-system rules) into freetheplatform/frontend/lint/
    // as a shared module both sites import; once that lands here too, this
    // local override goes away in favour of importing stylelintBaseConfig.
    "at-rule-no-unknown": [true, { ignoreAtRules: ["theme", "custom-variant", "apply"] }],

    /* ------------------------------------------------------------------
       1. Values come from the scale.
       ------------------------------------------------------------------ */
    "scale-unlimited/declaration-strict-value": [
      TOKENISED,
      {
        ignoreValues: NOT_A_DESIGN_DECISION,
        // Must be a string. Passing a function here silently swallows most of
        // the rule's own findings -- it reported 1 of 3 on a three-line probe.
        message:
          "Use a token, not a literal. Pick the nearest step in styles/tokens.css; " +
          "if none fits, the scale is wrong -- add the step there, not a literal here.",
      },
    ],

    /* ------------------------------------------------------------------
       2. Canonical breakpoints, min-width only.

       640 / 768 / 1024 / 1280 / 1536 match Tailwind's stock sm/md/lg/xl/2xl
       scale (and allbikes, which hand-writes no breakpoints at all and
       reads those utilities directly) -- see tailwind-migration.md Phase 1.
       900px and 1080px are freethedesk's pre-migration values, kept allowed
       only until Phase 4 converts their remaining consumers (admin.css,
       DashboardChrome.css, case-study.css, phone-mockup.css, SiteFooter.css,
       and three .module.css files); do not add new 900px/1080px uses.
       The codebase had also grown 680 and 980 as well, plus one max-width
       that inverts the mobile-first direction the whole file is built on.
       ------------------------------------------------------------------ */
    "media-feature-name-value-allowed-list": {
      "min-width": ["640px", "768px", "900px", "1024px", "1080px", "1280px", "1536px"],
    },
    "media-feature-name-disallowed-list": ["max-width", "max-height"],

    /* ------------------------------------------------------------------
       3. The two rules tokens.css states in prose and nothing enforced.
       ------------------------------------------------------------------ */
    "declaration-property-value-disallowed-list": [
      {
        // "Never write a bare `1fr` grid track." A bare 1fr is minmax(auto, 1fr)
        // and cannot shrink below its content, which overflows and gets clipped.
        //
        // The lookbehind is the whole rule. Without it the pattern also matches
        // the 1fr INSIDE minmax(0, 1fr) -- the correct form -- and reports every
        // well-written track in the repo as a defect. It flagged 119 of them
        // before this was fixed; the real count is zero.
        "grid-template-columns": [/(?<!minmax\([^()]*)(?<![\w.-])1fr\b/],
        "grid-template-rows": [/(?<!minmax\([^()]*)(?<![\w.-])1fr\b/],
        "grid-auto-columns": [/(?<!minmax\([^()]*)(?<![\w.-])1fr\b/],
        "grid-auto-rows": [/(?<!minmax\([^()]*)(?<![\w.-])1fr\b/],
      },
      {
        message: "Bare `1fr` cannot shrink below its content. Use `minmax(0, 1fr)`.",
      },
    ],

    /* ------------------------------------------------------------------
       4. Naming. A new token joins a family; it does not start a private one.
       ------------------------------------------------------------------ */
    "custom-property-pattern": [
      "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
      { message: "Custom properties are kebab-case: --space-2xs, not --spaceXS." },
    ],

    /* ------------------------------------------------------------------
       CSS Modules vocabulary that stylelint-config-standard does not know.
       ------------------------------------------------------------------ */
    "selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["global", "local"] }],
    "property-no-unknown": [true, { ignoreProperties: ["composes"] }],
    // Modules name classes in camelCase (they are read as JS properties);
    // global sheets use kebab-case. Both are house style, so allow either.
    "selector-class-pattern": [
      "^[a-z][a-zA-Z0-9]*(-[a-z0-9]+)*$",
      { message: "Class selectors are camelCase in modules, kebab-case in global sheets." },
    ],

    /* ------------------------------------------------------------------
       Cosmetic rules from the standard config, off because Prettier already
       owns formatting and the two disagree.
       ------------------------------------------------------------------ */
    "declaration-empty-line-before": null,
    "comment-empty-line-before": null,
    "rule-empty-line-before": null,
    "custom-property-empty-line-before": null,
    "no-descending-specificity": null,
    "alpha-value-notation": null,
    "color-function-notation": null,
    "value-keyword-case": null,
    // Wants `(width >= 640px)`. tokens.css mandates min-width prefix notation
    // and the mobile-first rule is written in terms of it, so keep the prefix.
    "media-feature-range-notation": "prefix",
    "color-function-alias-notation": null,
    // Wants url("..."). A bare string is valid CSS and is what this repo uses.
    "import-notation": null,
    "at-rule-empty-line-before": null,
    "declaration-block-no-redundant-longhand-properties": null,
    // Off entirely, not merely ignored. `ignoreProperties: ["background-clip"]`
    // does NOT match "-webkit-background-clip", so --fix stripped the prefix in
    // six files and broke gradient text in Safari. The rule cannot be trusted
    // here while the autofix is that eager.
    "property-no-vendor-prefix": null,
    // The five pre-existing cases were resolved; duplicates now block regressions.
    "no-duplicate-selectors": true,
  },
};
