"use client";

import { useEffect, useRef } from "react";

type Blob = {
  colour: string; // "r, g, b"
  cx: number;
  cy: number; // base centre, fraction of width/height
  ax: number;
  ay: number; // drift amplitude, fraction
  wx: number;
  wy: number; // drift angular speed
  px: number;
  py: number; // phase offsets
  radius: number; // fraction of min(w, h)
  alpha: number;
};

const BLOBS: Blob[] = [
  { colour: "163, 214, 245", cx: 0.30, cy: 0.44, ax: 0.14, ay: 0.11, wx: 0.16, wy: 0.12, px: 0.0, py: 1.7, radius: 0.66, alpha: 0.72 },
  { colour: "121, 192, 239", cx: 0.64, cy: 0.33, ax: 0.17, ay: 0.13, wx: 0.13, wy: 0.18, px: 2.1, py: 0.4, radius: 0.58, alpha: 0.66 },
  { colour: "63, 143, 208", cx: 0.80, cy: 0.62, ax: 0.15, ay: 0.12, wx: 0.18, wy: 0.14, px: 4.0, py: 2.6, radius: 0.52, alpha: 0.55 },
  { colour: "23, 58, 120", cx: 0.52, cy: 0.76, ax: 0.18, ay: 0.10, wx: 0.10, wy: 0.15, px: 1.0, py: 3.3, radius: 0.46, alpha: 0.34 },
  { colour: "143, 227, 240", cx: 0.38, cy: 0.26, ax: 0.16, ay: 0.14, wx: 0.17, wy: 0.13, px: 3.4, py: 5.1, radius: 0.44, alpha: 0.5 },
  { colour: "150, 180, 235", cx: 0.88, cy: 0.28, ax: 0.12, ay: 0.13, wx: 0.14, wy: 0.17, px: 5.5, py: 0.9, radius: 0.48, alpha: 0.46 },
];

/**
 * Aurora / gradient-mesh backdrop for the Home v2 hero. Renders a handful of
 * soft radial-gradient blobs on a small canvas that follow slow looping
 * (Lissajous) paths; the heavy blur that sells the effect is applied in CSS.
 * Draws a single static frame when reduced motion is requested, and pauses
 * while the tab is hidden.
 */
export function AuroraHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SCALE = 0.6; // render small; CSS blur upscales it
    let w = 0;
    let h = 0;
    let raf = 0;
    const startedAt = performance.now();

    const resize = () => {
      const rect = host.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width * SCALE));
      h = Math.max(1, Math.round(rect.height * SCALE));
      canvas.width = w;
      canvas.height = h;
    };

    const render = (now: number) => {
      const t = reduceMotion ? 0 : (now - startedAt) / 1000;
      const unit = Math.min(w, h);
      ctx.clearRect(0, 0, w, h);
      for (const b of BLOBS) {
        const x = (b.cx + b.ax * Math.sin(t * b.wx + b.px)) * w;
        const y = (b.cy + b.ay * Math.sin(t * b.wy + b.py)) * h;
        const r = b.radius * unit;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, `rgba(${b.colour}, ${b.alpha})`);
        gradient.addColorStop(1, `rgba(${b.colour}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduceMotion) raf = window.requestAnimationFrame(render);
    };

    const onResize = () => {
      resize();
      if (reduceMotion) render(performance.now());
    };
    const onVisibility = () => {
      if (document.hidden) window.cancelAnimationFrame(raf);
      else if (!reduceMotion) raf = window.requestAnimationFrame(render);
    };

    resize();
    render(performance.now());

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="hv2-aurora" aria-hidden="true" />;
}
