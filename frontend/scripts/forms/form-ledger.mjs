/**
 * Every form in the app is on a track, or is excluded with a written reason.
 *
 * Shared engine — edit it in `freetheplatform/frontend/registry/tooling/forms/`
 * and re-sync, never in a product. The ledger it checks is repo-specific and is
 * the whole point: adding a row is where somebody has to say, in words, which
 * track a new form is on or why it is not a form.
 *
 * Why a ledger and not a sniffer. The obvious check — find `<form>`, look for
 * `useActionState` or `zodResolver` beside it — is wrong in both directions.
 * A Track B form's schema and action live in sibling files, not in the
 * component. A shared wrapper can own the `<form>` for a panel whose rules live
 * somewhere else entirely, so the file with the markup has no track and the
 * file with the track has no markup. And a configurator preview that renders a
 * mocked customer site has a `<form>` that submits nowhere. None of those can
 * be told apart by reading one file; all of them can be written down once.
 *
 * So this checks the thing a script can actually check: that the ledger and the
 * tree agree. A new form is a new row. A deleted form is a deleted row. What it
 * cannot check is whether a row is honest — that is what review is for, and
 * why every excluded row carries its reason in the same table.
 *
 * See freetheplatform/_docs/forms-standard.md.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SKIP_DIRECTORIES = new Set(['node_modules', '.next', 'dist', 'build']);

function walk(directory, out = []) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      if (!SKIP_DIRECTORIES.has(entry)) walk(path, out);
    } else if (entry.endsWith('.tsx')) {
      out.push(path);
    }
  }
  return out;
}

/** A `<form` opening tag, not the word "form" in prose or a className. */
const FORM_TAG = /<form[\s>]/;

export function checkFormLedger({ root, ledger }) {
  const source = join(root, 'src');
  const found = new Set();
  for (const path of walk(source)) {
    if (FORM_TAG.test(readFileSync(path, 'utf8'))) {
      found.add(relative(source, path).split(sep).join('/'));
    }
  }

  const listed = new Map(ledger.map((row) => [row.file, row]));
  const problems = [];

  for (const file of [...found].sort()) {
    if (!listed.has(file)) {
      problems.push(
        `  ${file}\n      renders a <form> and is not in the ledger. Add a row saying which\n      track it is on, or why neither applies.`,
      );
    }
  }
  for (const row of ledger) {
    if (!found.has(row.file)) {
      problems.push(
        `  ${row.file}\n      is in the ledger but renders no <form>. Remove the row, or point it\n      at the file that does.`,
      );
    }
    if (row.track !== 'A' && row.track !== 'B' && !String(row.why ?? '').trim()) {
      problems.push(
        `  ${row.file}
      is '${row.track}' with no reason given. A row that is not on a track
      says why in words: what excludes it, who owns it, or what is left.`,
      );
    }
  }

  if (problems.length) {
    console.error('check-forms: the ledger and the tree disagree.\n');
    console.error(problems.join('\n'));
    console.error(
      '\nThe ledger is this file. The rules are\n' +
        'freetheplatform/_docs/forms-standard.md, and what is outstanding is\n' +
        '_docs/forms-migration.md.',
    );
    process.exit(1);
  }

  const counts = ledger.reduce((totals, row) => {
    totals[row.track] = (totals[row.track] ?? 0) + 1;
    return totals;
  }, {});
  const summary = Object.entries(counts)
    .sort()
    .map(([track, count]) => `${count} ${track}`)
    .join(', ');
  console.log(
    `check-forms: all ${found.size} files rendering a <form> are accounted for (${summary}).`,
  );
}
