"use client";

import { useEffect, useRef } from "react";

type VortexNode = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  energy: number;
};
type Charge = { x: number; y: number; life: number; strength: number };

const TAU = Math.PI * 2;

export function VortexField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let direction = 1;
    let nodes: VortexNode[] = [];
    let charges: Charge[] = [];
    let lastTime = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, px: 0, py: 0, speed: 0, active: false };

    const seedNodes = () => {
      const count = Math.max(38, Math.min(72, Math.round((width * height) / 20000)));
      nodes = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: index % 12 === 0 ? 4 : index % 4 === 0 ? 2.4 : 1.35,
        phase: Math.random() * TAU,
        energy: 0,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      seedNodes();
    };

    const influenceNode = (node: VortexNode, x: number, y: number, strength: number, swirl: number) => {
      const dx = x - node.x;
      const dy = y - node.y;
      const reach = 330;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared > reach * reach) return;
      const distance = Math.sqrt(distanceSquared) || 1;
      const proximity = 1 - distance / reach;
      const falloff = proximity * proximity * strength;
      node.vx += (dx / distance) * falloff - (dy / distance) * falloff * swirl * direction;
      node.vy += (dy / distance) * falloff + (dx / distance) * falloff * swirl * direction;
    };

    const drawLinks = () => {
      const linkDistance = width < 700 ? 118 : 152;
      const linkDistanceSquared = linkDistance * linkDistance;
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared >= linkDistanceSquared) continue;
          const energy = Math.max(a.energy, b.energy);
          const proximity = 1 - Math.sqrt(distanceSquared) / linkDistance;
          const hue = 205 + energy * 95;
          const saturation = 78 + energy * 18;
          const lightness = 47 + energy * 7;
          const alpha = (0.22 + energy * 0.7) * (0.5 + proximity * 0.5);
          context.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
          context.lineWidth = 1 + energy * 0.9;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    };

    const drawField = (time: number, dt: number) => {
      charges.forEach((charge) => { charge.life -= dt * 1.5; });
      charges = charges.filter((charge) => charge.life > 0);
      nodes.forEach((node) => {
        if (pointer.active) influenceNode(node, pointer.x, pointer.y, 0.115 + pointer.speed * 0.003, 1.32);
        charges.forEach((charge) => influenceNode(node, charge.x, charge.y, charge.strength * charge.life, 0.5));

        if (!pointer.active) {
          const centerX = width * 0.72;
          const centerY = height * 0.5;
          influenceNode(node, centerX, centerY, 0.006, 1.4);
        }

        if (!reduceMotion) {
          node.vx += Math.cos(time * 0.00022 + node.phase) * 0.0015;
          node.vy += Math.sin(time * 0.00019 + node.phase) * 0.0015;
          const speed = Math.hypot(node.vx, node.vy);
          if (speed > 5.2) {
            node.vx = (node.vx / speed) * 5.2;
            node.vy = (node.vy / speed) * 5.2;
          }
          const targetEnergy = Math.min(speed / 5.2, 1);
          node.energy += (targetEnergy - node.energy) * Math.min(1, dt * 3.2);
          node.x += node.vx * dt * 60;
          node.y += node.vy * dt * 60;
          node.vx *= Math.pow(0.988, dt * 60);
          node.vy *= Math.pow(0.988, dt * 60);
        }

        if (node.x < -25) node.x = width + 25;
        if (node.x > width + 25) node.x = -25;
        if (node.y < -25) node.y = height + 25;
        if (node.y > height + 25) node.y = -25;
      });

      drawLinks();

      nodes.forEach((node) => {
        const blue = node.phase > Math.PI;
        const hue = blue ? 207 - node.energy * 22 : 253 + node.energy * 52;
        const saturation = 72 + node.energy * 24;
        const lightness = blue ? 46 + node.energy * 8 : 56 + node.energy * 4;
        const haloRadius = node.radius * (2.2 + node.energy * 2.2);
        context.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${node.energy * 0.22})`;
        context.beginPath();
        context.arc(node.x, node.y, haloRadius, 0, TAU);
        context.fill();

        const pulse = 1 + Math.sin(time * 0.002 + node.phase) * 0.18;
        const radius = node.radius * pulse * (1 + node.energy * 0.32);
        context.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        context.beginPath();
        context.arc(node.x, node.y, radius, 0, TAU);
        context.fill();
      });
    };

    const draw = (time: number) => {
      if (!running) return;
      frame = window.requestAnimationFrame(draw);
      const frameInterval = reduceMotion ? 1000 / 12 : 1000 / 36;
      if (time - lastTime < frameInterval) return;
      const dt = Math.min((time - lastTime) / 1000 || 0.016, 0.034);
      lastTime = time;
      context.clearRect(0, 0, width, height);
      drawField(time, dt);
      pointer.speed *= 0.88;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const x = event.offsetX;
      const y = event.offsetY;
      pointer.px = pointer.active ? pointer.x : x;
      pointer.py = pointer.active ? pointer.y : y;
      pointer.x = x;
      pointer.y = y;
      pointer.speed = Math.min(45, Math.hypot(x - pointer.px, y - pointer.py));
      pointer.active = true;
      if (!reduceMotion && pointer.speed > 4) {
        const previousCharge = charges[charges.length - 1];
        if (!previousCharge || Math.hypot(x - previousCharge.x, y - previousCharge.y) > 18) {
          charges.push({ x, y, life: 1, strength: 0.016 + pointer.speed * 0.0012 });
          if (charges.length > 8) charges.shift();
        }
      }
    };

    const onPointerLeave = () => { pointer.active = false; };
    const onPointerDown = () => { direction *= -1; };
    const start = () => {
      if (running || document.hidden) return;
      running = true;
      lastTime = performance.now();
      frame = window.requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    }, { rootMargin: "100px" });
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (canvas.getBoundingClientRect().bottom > -100 && canvas.getBoundingClientRect().top < window.innerHeight + 100) start();
    };
    const resizeObserver = new ResizeObserver(resize);
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    resize();
    start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return <canvas ref={canvasRef} className="experiment-canvas" aria-hidden="true" />;
}
