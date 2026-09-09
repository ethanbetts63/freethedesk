import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { renderMarkdown } from "@/lib/markdown";

import styles from "./legal.module.css";

export async function LegalDocument({ filename }: { filename: string }) {
  const source = await readFile(path.join(process.cwd(), "content", "legal", filename), "utf8");
  const html = await renderMarkdown(source);

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />
      <article className={styles.document} dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
