/**
 * What the sample's drawn charts share with the engine's Vega charts: the house config render.py gives every chart
 * (its 11-pixel labels, their colours, the dotted grid), and the two widths each is drawn at, a desktop's and a
 * phone's, for the stylesheet to show one (`.chart--wide`, `.chart--phone`).
 */

export type Frame = {
  width: number;
  /** Where a bar chart's category labels end; the plot starts after them. */
  labelColumn: number;
  /** About how many characters fit in that column before a label wraps. */
  labelChars: number;
};

export const WIDE: Frame = { width: 760, labelColumn: 190, labelChars: 30 };
export const NARROW: Frame = { width: 320, labelColumn: 112, labelChars: 17 };

export const CHART_FONT = 11;

/** The engine's palette for a chart's furniture (palette.vega_colours, through the stylesheet's tokens). */
export const AXIS = {
  ink: 'var(--ink)',
  muted: 'var(--ink-3)',
  rule: 'var(--rule)',
};

/** A value axis's ticks from nought to a round figure past the largest value, in steps of 1, 2 or 5 times a power of ten. */
export function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((unit) => unit * power).find((unit) => unit >= raw) ?? power * 10;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let tick = 0; tick <= top + step / 2; tick += step) ticks.push(Number(tick.toFixed(6)));
  return ticks;
}

/** A label broken into lines of about `chars` characters, at its spaces, never inside a word. */
export function wrapLabel(label: string, chars: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of label.split(' ')) {
    if (line && (line + ' ' + word).length > chars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}
