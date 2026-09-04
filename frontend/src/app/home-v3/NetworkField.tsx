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

export function NetworkField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let nodes: Node[] = [];
    const pointer = { x: -1000, y: -1000, active: false };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const makeNodes = () => {
      const count = Math.max(28, Math.min(82, Math.round((width * height) / 18000)));
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
            const opacity = (1 - distance / linkDistance) * 0.34;
            const gradient = context.createLinearGradient(a.x, a.y, b.x, b.y);
            gradient.addColorStop(0, `rgba(36, 126, 201, ${opacity})`);
            gradient.addColorStop(1, `rgba(19, 49, 92, ${opacity * 0.72})`);
            context.strokeStyle = gradient;
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
        if (pointer.active && pointerDistance < 190 && pointerDistance > 0) {
          const pull = (1 - pointerDistance / 190) * 0.012;
          node.vx += ((pointer.x - node.x) / pointerDistance) * pull;
          node.vy += ((pointer.y - node.y) / pointerDistance) * pull;
        }

        if (!reduceMotion) {
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.996;
          node.vy *= 0.996;
          node.vx += Math.sin(time * 0.00016 + node.phase) * 0.0008;
          node.vy += Math.cos(time * 0.00014 + node.phase) * 0.0008;
        }

        if (node.x < -10) node.x = width + 10;
        if (node.x > width + 10) node.x = -10;
        if (node.y < -10) node.y = height + 10;
        if (node.y > height + 10) node.y = -10;

        const pulse = reduceMotion ? 1 : 1 + Math.sin(time * 0.0015 + node.phase) * 0.16;
        context.fillStyle = node.tone === "dark" ? "#13315c" : "#5aaee9";
        context.beginPath();
        context.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
        context.fill();

        if (node.radius > 4) {
          context.strokeStyle = "rgba(61, 146, 211, .2)";
          context.lineWidth = 1;
          context.beginPath();
          context.arc(node.x, node.y, 11 * pulse, 0, Math.PI * 2);
          context.stroke();
        }
      });

      if (!reduceMotion) frame = window.requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => { pointer.active = false; };
    resize();
    draw(0);
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
