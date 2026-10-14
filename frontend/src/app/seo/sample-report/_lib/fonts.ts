import localFont from 'next/font/local';

/**
 * The two faces the PDF reports are set in, so the sample reads as the
 * deliverable rather than as another page of the site. Archivo carries
 * headings, labels and every figure; Source Serif 4 carries the prose. Both
 * SIL OFL 1.1, latin subset, variable weight, copied from the report renderer
 * (freetheplatform/src/freetheplatform/searchconsole/assets/vendor, whose
 * SOURCES.txt records where each came from). Loaded here only, so no other
 * route pays for them.
 */
export const reportDisplay = localFont({
  src: '../_fonts/archivo-latin.woff2',
  weight: '100 900',
  display: 'swap',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
});

export const reportSerif = localFont({
  src: '../_fonts/source-serif-4-latin.woff2',
  weight: '200 900',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});
