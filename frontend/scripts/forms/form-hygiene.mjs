/**
 * The parts of the forms standard a script can hold, beyond the ledger.
 *
 * Shared engine — edit it in `freetheplatform/frontend/registry/tooling/forms/`
 * and re-sync, never in a product. The repo-specific facts (which cookies are
 * the session, which files may read the Django base URL) are passed in by each
 * repo's `scripts/check-forms.mjs`, ledger-style: an exception is a row with a
 * written reason, not a silent gap in a pattern.
 *
 * Four checks:
 *
 * 1. Form schemas live in `*.schema.ts`. A `z.object(` anywhere else is either
 *    a form schema hiding from check 2, or a legitimate non-form use that
 *    belongs in `schemaExceptions` with its reason.
 * 2. Every `z.string(` chain in a `*.schema.ts` carries `.max(`, and a raw
 *    numeric ceiling never exceeds 255 (`FIELD_MAX.line`) — anything wider is a
 *    field kind and takes its ceiling from `FIELD_MAX`, so the frontend and the
 *    serializer bound the same field from opposite ends. Tighter-than-kind
 *    numerics (a 17-char VIN) are fine; the rule is that a ceiling exists and
 *    that big ones are never invented locally.
 * 3. `DJANGO_API_URL` is read only by the files that own it. One place owns the
 *    base and its fallback; an inline re-read is how an app ends up half on
 *    `localhost` (which can resolve IPv6-first) and half on `127.0.0.1`.
 * 4. Only the local wrapper imports the package `serverApiFetch`, and its
 *    `forwardCookies` allowlist is exactly the session cookies, named
 *    literally. A Server Action reads the whole cookie jar; without the
 *    allowlist everything in it goes to Django — analytics, consent flags, and
 *    any per-record capability cookie the site issues.
 *
 * What these cannot check is whether a schema's ceilings use the *right* kinds,
 * or whether a track was chosen correctly — that is review's job, and the
 * judgement rows in freetheplatform/_docs/forms-standard.md name it as such.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SKIP_DIRECTORIES = new Set(['node_modules', '.next', 'dist', 'build']);

function walk(directory, out = []) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      if (!SKIP_DIRECTORIES.has(entry)) walk(path, out);
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      out.push(path);
    }
  }
  return out;
}

/**
 * Every `z.string(...)` call in `text` with the full method chain hanging off
 * it (`.trim().max(FIELD_MAX.name).optional()` …), found by walking balanced
 * parentheses rather than by line, so a prettier-wrapped chain still reads as
 * one chain.
 */
function stringChains(text) {
  const chains = [];
  const opener = /z\.string\(/g;
  let match;
  while ((match = opener.exec(text)) !== null) {
    let i = match.index + match[0].length - 1; // at the '('
    let depth = 0;
    do {
      if (text[i] === '(') depth += 1;
      else if (text[i] === ')') depth -= 1;
      i += 1;
    } while (depth > 0 && i < text.length);
    // Consume `.method(...)` links while they follow.
    for (;;) {
      let j = i;
      while (/\s/.test(text[j])) j += 1;
      if (text[j] !== '.') break;
      j += 1;
      while (/[\w$]/.test(text[j])) j += 1;
      while (/\s/.test(text[j])) j += 1;
      if (text[j] !== '(') break;
      depth = 0;
      do {
        if (text[j] === '(') depth += 1;
        else if (text[j] === ')') depth -= 1;
        j += 1;
      } while (depth > 0 && j < text.length);
      i = j;
    }
    chains.push({
      line: text.slice(0, match.index).split('\n').length,
      chain: text.slice(match.index, i),
    });
  }
  return chains;
}

const WIDEST_RAW_CEILING = 255; // FIELD_MAX.line

export function checkFormHygiene({
  root,
  sessionCookies,
  wrapperFile = 'lib/serverApi.ts',
  envReaders = [],
  schemaExceptions = [],
}) {
  const source = join(root, 'src');
  const problems = [];
  const posix = (path) => relative(source, path).split(sep).join('/');

  let schemaFiles = 0;
  const envAllowed = new Map(envReaders.map((row) => [row.file, row]));
  const schemaAllowed = new Map(schemaExceptions.map((row) => [row.file, row]));
  for (const row of [...envReaders, ...schemaExceptions]) {
    if (!String(row.why ?? '').trim()) {
      problems.push(
        `  ${row.file}\n      is listed as an exception with no reason given. Say why.`,
      );
    }
  }

  for (const path of walk(source)) {
    const file = posix(path);
    const text = readFileSync(path, 'utf8');
    const isSchema = file.endsWith('.schema.ts');

    if (isSchema) {
      schemaFiles += 1;
      for (const { line, chain } of stringChains(text)) {
        const ceiling = chain.match(/\.max\(\s*([^),]*)/);
        if (!ceiling) {
          problems.push(
            `  ${file}:${line}\n      z.string() with no .max(). Every string field carries a ceiling —\n      use a FIELD_MAX kind (forms-standard.md, FORMS-6).`,
          );
        } else if (/^\d+$/.test(ceiling[1].trim()) && Number(ceiling[1]) > WIDEST_RAW_CEILING) {
          problems.push(
            `  ${file}:${line}\n      .max(${ceiling[1].trim()}) is a raw number wider than FIELD_MAX.line (255).\n      A ceiling that big is a field kind — take it from FIELD_MAX so the\n      serializer side bounds the same field.`,
          );
        }
      }
    } else if (/\bz\.object\(/.test(text) && !schemaAllowed.has(file)) {
      problems.push(
        `  ${file}\n      builds a z.object() outside a *.schema.ts file. A form schema lives\n      in its own schema file beside the form; if this is not a form,\n      add it to schemaExceptions with the reason.`,
      );
    }

    if (/\bDJANGO_API_URL\b/.test(text) && !envAllowed.has(file)) {
      problems.push(
        `  ${file}\n      reads DJANGO_API_URL inline. The base URL and its fallback are owned\n      by ${envReaders.map((row) => row.file).join(', ') || 'one lib module'} —\n      import the constant instead, or add an envReaders row saying why not.`,
      );
    }

    if (file !== wrapperFile) {
      const imports = text.matchAll(
        /import\s+(?:type\s+)?{([^}]*)}\s*from\s*['"]@freetheplatform\/web-security['"]/g,
      );
      for (const found of imports) {
        if (/\bserverApiFetch\b/.test(found[1])) {
          problems.push(
            `  ${file}\n      imports serverApiFetch from the package directly. Only ${wrapperFile}\n      does that — it is where the cookie allowlist lives. Import the local\n      wrapper instead.`,
          );
        }
      }
    }
  }

  const wrapper = readFileSync(join(source, ...wrapperFile.split('/')), 'utf8');
  const declared = wrapper.match(/const SESSION_COOKIES\s*=\s*\[([^\]]*)\]/);
  const literals = declared ? [...declared[1].matchAll(/'([^']*)'|"([^"]*)"/g)] : [];
  const cookies = literals.map((m) => m[1] ?? m[2]);
  if (!declared || !/forwardCookies:\s*SESSION_COOKIES\b/.test(wrapper)) {
    problems.push(
      `  ${wrapperFile}\n      must pass forwardCookies: SESSION_COOKIES, with SESSION_COOKIES a\n      literal array. Name the cookies; never forward the jar.`,
    );
  } else if (
    cookies.length !== sessionCookies.length ||
    sessionCookies.some((name) => !cookies.includes(name))
  ) {
    problems.push(
      `  ${wrapperFile}\n      forwards [${cookies.join(', ')}] but the session cookies are\n      [${sessionCookies.join(', ')}]. Django reads nothing else — every extra\n      name here is a cookie leaked to it on every authenticated action.`,
    );
  }

  if (problems.length) {
    console.error('check-forms: hygiene problems.\n');
    console.error(problems.join('\n'));
    console.error('\nThe rules are freetheplatform/_docs/forms-standard.md.');
    process.exit(1);
  }

  console.log(
    `check-forms: ${schemaFiles} schema files bounded; DJANGO_API_URL confined to ` +
      `${envReaders.length} file(s); forwarding only [${sessionCookies.join(', ')}].`,
  );
}
