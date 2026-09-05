import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";

import styles from "./legal.module.css";

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph" | "notice"; text: string }
  | { type: "unordered" | "ordered"; items: string[] };

function blocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const result: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      result.push({ type: "heading", level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      result.push({ type: "notice", text: line.slice(2) });
      index += 1;
      continue;
    }

    const unordered = line.startsWith("- ");
    const ordered = /^\d+\.\s/.test(line);
    if (unordered || ordered) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].trim();
        if (unordered && item.startsWith("- ")) items.push(item.slice(2));
        else if (ordered && /^\d+\.\s/.test(item)) items.push(item.replace(/^\d+\.\s/, ""));
        else break;
        index += 1;
      }
      result.push({ type: unordered ? "unordered" : "ordered", items });
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (!next || /^(#{1,3})\s/.test(next) || next.startsWith("> ") || next.startsWith("- ") || /^\d+\.\s/.test(next)) break;
      paragraph.push(next);
      index += 1;
    }
    result.push({ type: "paragraph", text: paragraph.join(" ") });
  }
  return result;
}

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const linkPattern = /\[([^\]]+)]\(([^)]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(text))) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(<a href={match[2]} key={`${match.index}-${match[2]}`}>{match[1]}</a>);
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export async function LegalDocument({ filename }: { filename: string }) {
  const source = await readFile(path.join(process.cwd(), "content", "legal", filename), "utf8");
  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />
      <article className={styles.document}>
        {blocks(source).map((block, index) => {
          if (block.type === "heading") {
            if (block.level === 1) return <h1 key={index}>{inline(block.text)}</h1>;
            if (block.level === 2) return <h2 key={index}>{inline(block.text)}</h2>;
            return <h3 key={index}>{inline(block.text)}</h3>;
          }
          if (block.type === "notice") return <aside key={index}>{inline(block.text)}</aside>;
          if (block.type === "paragraph") return <p key={index}>{inline(block.text)}</p>;
          if (block.type === "unordered") return <ul key={index}>{block.items.map((item) => <li key={item}>{inline(item)}</li>)}</ul>;
          if (block.type === "ordered") return <ol key={index}>{block.items.map((item) => <li key={item}>{inline(item)}</li>)}</ol>;
          return null;
        })}
      </article>
    </main>
  );
}
