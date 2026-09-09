"use client";

import { useCallback, useRef } from "react";

import { useCanvasAnimation, type CanvasFrame } from "./useCanvasAnimation";

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
  nodeLight: string;

  nodeDark: string;

  linkStart: string;

  linkEnd: string;

  ring: string;
};

export const DEFAULT_NETWORK_COLORS: NetworkFieldColors = {
  nodeLight: "#5aaee9",
  nodeDark: "#13315c",
  linkStart: "36, 126, 201",
  linkEnd: "19, 49, 92",
  ring: "61, 146, 211",
};

const POINTER_RADIUS = 260;
const EVENT_HORIZON = 16;
const PULL_STRENGTH = 0.02;
const SWIRL_STRENGTH = 0.011;
const MAX_SPEED = 2.4;

const OPACITY_BANDS = 5;

function blend(start: string, end: string): string {
  const parse = (value: string) => value.split(",").map((part) => parseFloat(part));
  const [r1, g1, b1] = parse(start);
  const [r2, g2, b2] = parse(end);
  return `${Math.round((r1 + r2) / 2)}, ${Math.round((g1 + g2) / 2)}, ${Math.round((b1 + b2) / 2)}`;
}

export function NetworkField({ colors = DEFAULT_NETWORK_COLORS }: { colors?: NetworkFieldColors }) {
  const nodes = useRef<Node[]>([]);
  const pointer = useRef({ x: -1000, y: -1000, active: false });

  const onResize = useCallback(({ width, height }: { width: number; height: number }) => {
    const count = Math.max(61, Math.min(176, Math.round((width * height) / 8333)));
    nodes.current = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      radius: index % 11 === 0 ? 4.2 : index % 4 === 0 ? 2.8 : 1.8,
      tone: index % 5 === 0 ? "dark" : "light",
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  const draw = useCallback(
    ({ context, width, height, time, reduceMotion }: CanvasFrame) => {
      const linkColor = blend(colors.linkStart, colors.linkEnd);
      const list = nodes.current;
      context.clearRect(0, 0, width, height);

      const linkDistance = width < 700 ? 118 : 150;
      // Compared squared, so the inner loop never takes a square root.
      const linkDistanceSquared = linkDistance * linkDistance;

      // Collect each pair into an opacity band, then stroke one path per band.
      const bands: Array<number[]> = Array.from({ length: OPACITY_BANDS }, () => []);
      for (let i = 0; i < list.length; i += 1) {
        const a = list[i];
        for (let j = i + 1; j < list.length; j += 1) {
          const b = list[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const squared = dx * dx + dy * dy;
          if (squared >= linkDistanceSquared) continue;
          const closeness = 1 - Math.sqrt(squared) / linkDistance;
          const band = Math.min(OPACITY_BANDS - 1, Math.floor(closeness * OPACITY_BANDS));
          bands[band].push(a.x, a.y, b.x, b.y);
        }
      }

      context.lineWidth = 0.8;
      bands.forEach((segments, band) => {
        if (segments.length === 0) return;
        context.strokeStyle = `rgba(${linkColor}, ${((band + 0.5) / OPACITY_BANDS) * 0.34 * 0.86})`;
        context.beginPath();
        for (let i = 0; i < segments.length; i += 4) {
          context.moveTo(segments[i], segments[i + 1]);
          context.lineTo(segments[i + 2], segments[i + 3]);
        }
        context.stroke();
      });

      const cursor = pointer.current;
      list.forEach((node) => {
        const pointerDistance = Math.hypot(node.x - cursor.x, node.y - cursor.y);
        if (cursor.active && pointerDistance < POINTER_RADIUS) {
          const clamped = Math.max(pointerDistance, EVENT_HORIZON);
          const falloff = 1 - clamped / POINTER_RADIUS;
          const nx = (cursor.x - node.x) / (pointerDistance || 1);
          const ny = (cursor.y - node.y) / (pointerDistance || 1);
          const pull = falloff * falloff * PULL_STRENGTH;
          const swirl = falloff * SWIRL_STRENGTH;
          node.vx += nx * pull - ny * swirl;
          node.vy += ny * pull + nx * swirl;
        }

        if (!reduceMotion) {
          const speed = Math.hypot(node.vx, node.vy);
          if (speed > MAX_SPEED) {
            node.vx = (node.vx / speed) * MAX_SPEED;
            node.vy = (node.vy / speed) * MAX_SPEED;
          }
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.996;
          node.vy *= 0.996;
          node.vx += Math.sin(time * 0.00016 + node.phase) * 0.0008;
          node.vy += Math.cos(time * 0.00014 + node.phase) * 0.0008;
        }

        if (node.x < 0) {
          node.x = 0;
          node.vx = Math.abs(node.vx);
        }
        if (node.x > width) {
          node.x = width;
          node.vx = -Math.abs(node.vx);
        }
        if (node.y < 0) {
          node.y = 0;
          node.vy = Math.abs(node.vy);
        }
        if (node.y > height) {
          node.y = height;
          node.vy = -Math.abs(node.vy);
        }

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
          context.lineWidth = 0.8;
        }
      });
    },
    [colors],
  );

  const canvasRef = useCanvasAnimation({ draw, onResize });

  const trackPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
  };

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      onPointerMove={trackPointer}
      onPointerLeave={() => {
        pointer.current.active = false;
      }}
    />
  );
}
