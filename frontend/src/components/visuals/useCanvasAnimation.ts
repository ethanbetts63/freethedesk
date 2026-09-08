"use client";

import { useEffect, useRef } from "react";

export interface CanvasFrame {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** Milliseconds since the animation started. */
  time: number;
  /** True when the visitor asked for reduced motion: draw one static frame. */
  reduceMotion: boolean;
}

interface Options {
  /** Draws one frame. Called once immediately, then per rAF while on screen. */
  draw: (frame: CanvasFrame) => void;
  /** Rebuilds anything sized to the canvas — particles, sprite caches. */
  onResize?: (size: { width: number; height: number; ratio: number }) => void;
  /** Debounce for window resizes, in ms. */
  resizeDelay?: number;
}

/**
 * The scaffolding both background canvases need: device-pixel-ratio scaling, a
 * debounced resize, `prefers-reduced-motion` (one static frame, no loop), and
 * an IntersectionObserver that stops the loop while the canvas is off screen.
 */
export function useCanvasAnimation({ draw, onResize, resizeDelay = 150 }: Options) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Kept in a ref so a caller passing an inline closure does not restart the
  // animation — and lose its particle positions — on every render. The ref is
  // seeded at mount and refreshed after each render, never during one.
  const handlers = useRef({ draw, onResize });
  useEffect(() => {
    handlers.current = { draw, onResize };
  }, [draw, onResize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      handlers.current.onResize?.({ width, height, ratio });
    };

    const render = (time: number) => {
      handlers.current.draw({ context, width, height, time, reduceMotion });
      frame = !reduceMotion && visible ? window.requestAnimationFrame(render) : 0;
    };

    let resizeTimeout = 0;
    const onWindowResize = () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        resize();
        if (frame === 0) render(performance.now());
      }, resizeDelay);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible && !reduceMotion && frame === 0) frame = window.requestAnimationFrame(render);
      },
      { threshold: 0 },
    );

    resize();
    render(0);
    window.addEventListener("resize", onWindowResize);
    observer.observe(canvas);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimeout);
      window.removeEventListener("resize", onWindowResize);
      observer.disconnect();
    };
  }, [resizeDelay]);

  return canvasRef;
}
