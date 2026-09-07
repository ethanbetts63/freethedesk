"use client";

import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tone: "light" | "dark";
  phase: number;
};

export type NetworkFieldColors = {
  /** Node fill for the lighter tone. */
  nodeLight: string;
  /** Node fill for the darker tone, also used for large-node rings. */
  nodeDark: string;
  /** Link gradient start, as an "r, g, b" triplet. */
  linkStart: string;
  /** Link gradient end, as an "r, g, b" triplet. */
  linkEnd: string;
  /** Ring stroke around large nodes, as an "r, g, b" triplet. */
  ring: string;
};

/** Single place to retune the network's palette; pass `colors` to override per hero. */
export const DEFAULT_NETWORK_COLORS: NetworkFieldColors = {
  nodeLight: "#5aaee9",
  nodeDark: "#13315c",
  linkStart: "36, 126, 201",
  linkEnd: "19, 49, 92",
  ring: "61, 146, 211",
};

type NetworkFieldProps = {
  colors?: NetworkFieldColors;
};

export function NetworkField({ colors = DEFAULT_NETWORK_COLORS }: NetworkFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let nodes: Node[] = [];
    const pointer = { x: -1000, y: -1000, active: false };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Precompute a single blended link color so the per-pair draw below can use a
    // cheap solid stroke instead of allocating a canvas gradient per line per frame.
    const parseRgb = (value: string) => value.split(",").map((part) => parseFloat(part));
    const [r1, g1, b1] = parseRgb(colors.linkStart);
    const [r2, g2, b2] = parseRgb(colors.linkEnd);
    const linkColor = `${Math.round((r1 + r2) / 2)}, ${Math.round((g1 + g2) / 2)}, ${Math.round((b1 + b2) / 2)}`;

    const makeNodes = () => {
      const count = Math.max(61, Math.min(176, Math.round((width * height) / 8333)));
      nodes = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        radius: index % 11 === 0 ? 4.2 : index % 4 === 0 ? 2.8 : 1.8,
        tone: index % 5 === 0 ? "dark" : "light",
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      makeNodes();
    };

    const pointerRadius = 260;
    const eventHorizon = 16;
    const pullStrength = 0.02;
    const swirlStrength = 0.011;
    const maxSpeed = 2.4;
    const bounds = 0;

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const linkDistance = width < 700 ? 118 : 150;

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          if (distance < linkDistance) {
            const opacity = (1 - distance / linkDistance) * 0.34 * 0.86;
            context.strokeStyle = `rgba(${linkColor}, ${opacity})`;
            context.lineWidth = 0.8;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        const pointerDistance = Math.hypot(node.x - pointer.x, node.y - pointer.y);
        if (pointer.active && pointerDistance < pointerRadius) {
          const clampedDistance = Math.max(pointerDistance, eventHorizon);
          const falloff = 1 - clampedDistance / pointerRadius;
          const nx = (pointer.x - node.x) / (pointerDistance || 1);
          const ny = (pointer.y - node.y) / (pointerDistance || 1);
          const pull = falloff * falloff * pullStrength;
          const swirl = falloff * swirlStrength;
          node.vx += nx * pull - ny * swirl;
          node.vy += ny * pull + nx * swirl;
        }

        if (!reduceMotion) {
          const speed = Math.hypot(node.vx, node.vy);
          if (speed > maxSpeed) {
            node.vx = (node.vx / speed) * maxSpeed;
            node.vy = (node.vy / speed) * maxSpeed;
          }
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.996;
          node.vy *= 0.996;
          node.vx += Math.sin(time * 0.00016 + node.phase) * 0.0008;
          node.vy += Math.cos(time * 0.00014 + node.phase) * 0.0008;
        }

        if (node.x < -bounds) { node.x = -bounds; node.vx = Math.abs(node.vx); }
        if (node.x > width + bounds) { node.x = width + bounds; node.vx = -Math.abs(node.vx); }
        if (node.y < -bounds) { node.y = -bounds; node.vy = Math.abs(node.vy); }
        if (node.y > height + bounds) { node.y = height + bounds; node.vy = -Math.abs(node.vy); }

        const pulse = reduceMotion ? 1 : 1 + Math.sin(time * 0.0015 + node.phase) * 0.16;
        context.fillStyle = node.tone === "dark" ? colors.nodeDark : colors.nodeLight;
        context.beginPath();
        context.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
        context.fill();

        if (node.radius > 4) {
          context.strokeStyle = `rgba(${colors.ring}, .2)`;
          context.lineWidth = 1;
          context.beginPath();
          context.arc(node.x, node.y, 11 * pulse, 0, Math.PI * 2);
          context.stroke();
        }
      });

      if (!reduceMotion && visible) frame = window.requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => { pointer.active = false; };
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let resizeTimeout = 0;
    const onWindowResize = () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(resize, 150);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !reduceMotion) {
          window.cancelAnimationFrame(frame);
          frame = window.requestAnimationFrame(draw);
        }
      },
      { threshold: 0 },
    );

    resize();
    draw(0);
    window.addEventListener("resize", onWindowResize);
    observer.observe(canvas);
    if (supportsHover) {
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimeout);
      window.removeEventListener("resize", onWindowResize);
      observer.disconnect();
      if (supportsHover) {
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
      }
    };
  }, [colors]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
