import localFont from 'next/font/local';

/**
 * The two faces the delivered reports are set in, so the sample reads as the
 * deliverable rather than as another page of the site. Archivo carries
 * headings, labels and every figure; Source Serif 4 carries the prose, with
 * its italic. All SIL OFL 1.1, latin subset, variable weight, copied from the
 * report renderer (freetheplatform/src/freetheplatform/searchconsole/assets/vendor,
 * whose SOURCES.txt records where each came from). Loaded here only, so no
 * other route pays for them. Each sets the variable the engine's stylesheet
 * reads (`--display`, `--serif`; see _styles/sample.css).
 */
export const reportDisplay = localFont({
  src: '../_fonts/archivo-latin.woff2',
  weight: '100 900',
  display: 'swap',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
  variable: '--font-report-display',
});

export const reportSerif = localFont({
  src: [
    { path: '../_fonts/source-serif-4-latin.woff2', style: 'normal' },
    { path: '../_fonts/source-serif-4-latin-italic.woff2', style: 'italic' },
  ],
  weight: '200 900',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  variable: '--font-report-serif',
});
