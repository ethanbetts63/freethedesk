import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import {
  cssModuleBoundaryImports,
  designSystemNoRestrictedSyntax,
} from '../../freetheplatform/frontend/lint/design-system-eslint.mjs';

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    // The design-system checks, imported rather than copied: the canonical
    // definitions live in freetheplatform/frontend/lint/design-system-eslint.mjs
    // and allbikes reads the same file, so the two sites cannot drift into
    // disagreeing about what a token is for.
    //
    // All of them share ONE config object and one rule key on purpose. ESLint
    // flat config REPLACES a rule's options rather than merging them when
    // several matching objects configure the same rule, so splitting these
    // across blocks silently disables everything but the last one. Allbikes
    // learned that the expensive way; the note in its config is worth reading.
    name: 'freethedesk/design-system',
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      // Emits a JSON manifest, so it cannot read a CSS variable. Its two
      // colours are kept in step with the tokens by hand.
      'src/app/manifest.ts',
    ],
    rules: {
      'no-restricted-syntax': designSystemNoRestrictedSyntax(),
    },
  },
  {
    // CSS Modules are an approved-exception boundary, not a default - see
    // lint-rules.md's "Allowed handwritten CSS" table. Every file below is one
    // of the named exceptions and says which; a new one has to be added here,
    // which makes it a visible decision instead of a quiet import.
    name: 'freethedesk/css-module-boundary',
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      // The two uncontrolled-rich-content sheets (the article body and the
      // legal source documents) are excused on their import lines instead, so
      // the reason sits next to the import rather than in a glob here.
      // Complex pseudo-element artwork: the flow card's connectors and the
      // licensing comparison's gradient border are drawn, not laid out. Both
      // carry their reasoning in the stylesheet header.
      'src/components/visuals/FlowCardVisual.tsx',
      'src/app/licensing/_components/FlowCompare.tsx',
    ],
    rules: {
      'no-restricted-imports': cssModuleBoundaryImports(),
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'node_modules/**', 'next-env.d.ts']),
]);
