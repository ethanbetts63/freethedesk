/**
 * Fails the build when a page's OG image does not exist.
 *
 * A missing OG image is invisible until somebody shares the link and gets a
 * bare URL instead of a preview card. Bloomprint had eight of the nine images
 * its registry named never made, and `lib/seo.ts` carried a helper quietly
 * rerouting them to the default so the JSON-LD would not show the dead URL —
 * a workaround at the read site for a value nobody validated at the write
 * site. See seo-standard.md section 4.
 *
 * Only `public/`-relative paths are checked. An imported asset's `.src` is a
 * build-time hashed URL under `/_next/`, which exists by construction, and an
 * absolute URL belongs to someone else.
 *
 * This one still scans source TEXT where the other two checks import values,
 * and deliberately so. It is a superset scan with no idea which field it is
 * looking at, which is the point: an image path is worth validating wherever
 * it appears, including inside a function body that no export exposes. The
 * usual text-parsing hazard does not apply, because the pattern is anchored at
 * both ends on `'/…​.ext'` — prose cannot accidentally look like one. A quoting
 * style this misses costs a skipped check, never a wrong answer.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const IMAGE_LITERAL = /'(\/[^']*\.(?:webp|png|jpe?g|svg|avif|gif))'/g;

/**
 * @param {object} options
 * @param {string} options.root      Absolute path to the repo's `frontend`.
 * @param {string[]} options.sources Repo-relative files to scan.
 */
export function checkOgImages({ root, sources }) {
  const publicDir = join(root, 'public');
  const referenced = new Set();

  for (const relative of sources) {
    const source = readFileSync(join(root, relative), 'utf8');
    for (const match of source.matchAll(IMAGE_LITERAL)) referenced.add(match[1]);
  }

  const missing = [...referenced].filter((path) => !existsSync(join(publicDir, path)));

  if (missing.length) {
    console.error('\ncheck-og-images failed:\n');
    console.error(`• ${missing.length} image path(s) named in the registry do not exist:`);
    for (const path of missing) console.error(`    public${path}`);
    console.error(
      '\n  Make the file, point at an imported asset (`someImage.src`), or drop the' +
        '\n  field so the page falls back to the default OG image.\n',
    );
    process.exit(1);
  }

  console.log(`check-og-images: all ${referenced.size} referenced image paths exist.`);
}
