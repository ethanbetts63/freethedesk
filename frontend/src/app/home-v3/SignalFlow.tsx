"use client";

import { useEffect, useRef } from "react";

type Stream = {
  y: number;
  amplitude: number;
  frequency: number;
  phase: number;
  speed: number;
  color: string;
  width: number;
};

const STREAMS: Stream[] = [
  { y: .20, amplitude: 52, frequency: 1.45, phase: .2, speed: .000072, color: "rgba(35, 131, 207, .22)", width: 1 },
  { y: .28, amplitude: 84, frequency: 1.05, phase: 2.2, speed: -.00006, color: "rgba(19, 49, 92, .28)", width: 1.2 },
  { y: .39, amplitude: 58, frequency: 1.75, phase: 4.1, speed: .00009, color: "rgba(91, 174, 232, .34)", width: 1 },
  { y: .52, amplitude: 100, frequency: .85, phase: 1.4, speed: -.000048, color: "rgba(14, 77, 139, .2)", width: 1.4 },
  { y: .64, amplitude: 62, frequency: 1.3, phase: 3.3, speed: .000066, color: "rgba(63, 151, 218, .27)", width: 1 },
  { y: .76, amplitude: 74, frequency: 1.6, phase: 5.4, speed: -.000078, color: "rgba(19, 49, 92, .2)", width: 1.2 },
];

const DOT_BLUR = 12;
const DOT_RADIUS = { dark: 3.8, light: 2.5 };

function createDotSprite(fillColor: string, shadowColor: string, radius: number, ratio: number) {
  const size = (radius + DOT_BLUR) * 2;
  const sprite = document.createElement("canvas");
  sprite.width = Math.ceil(size * ratio);
  sprite.height = Math.ceil(size * ratio);
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  ctx.scale(ratio, ratio);
  ctx.fillStyle = fillColor;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = DOT_BLUR;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  ctx.fill();
  return sprite;
}

export function SignalFlow() {
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
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let darkSprite = canvas;
    let lightSprite = canvas;
    let darkSize = 0;
    let lightSize = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      darkSprite = createDotSprite("#13315c", "rgba(19, 49, 92, .28)", DOT_RADIUS.dark, ratio);
      lightSprite = createDotSprite("#3f97da", "rgba(63, 151, 218, .4)", DOT_RADIUS.light, ratio);
      darkSize = (DOT_RADIUS.dark + DOT_BLUR) * 2;
      lightSize = (DOT_RADIUS.light + DOT_BLUR) * 2;
    };

    const point = (stream: Stream, progress: number, time: number) => {
      const x = progress * (width + 240) - 120;
      const wave = Math.sin(progress * Math.PI * 2 * stream.frequency + stream.phase + time * stream.speed);
      const fineWave = Math.sin(progress * Math.PI * 6 + stream.phase) * 9;
      return { x, y: height * stream.y + wave * stream.amplitude + fineWave };
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      STREAMS.forEach((stream, streamIndex) => {
        context.beginPath();
        for (let step = 0; step <= 100; step += 1) {
          const position = point(stream, step / 100, time);
          if (step === 0) context.moveTo(position.x, position.y);
          else context.lineTo(position.x, position.y);
        }
        context.strokeStyle = stream.color;
        context.lineWidth = stream.width;
        context.stroke();

        const pulseCount = streamIndex % 2 === 0 ? 3 : 2;
        for (let pulse = 0; pulse < pulseCount; pulse += 1) {
          const raw = reduceMotion ? (pulse + 1) / (pulseCount + 1) : time * (.000021 + streamIndex * .0000012) + pulse / pulseCount + streamIndex * .13;
          const position = point(stream, raw % 1, time);
          const dark = (pulse + streamIndex) % 3 === 0;

          const sprite = dark ? darkSprite : lightSprite;
          const size = dark ? darkSize : lightSize;
          context.drawImage(sprite, position.x - size / 2, position.y - size / 2, size, size);
        }
      });

      if (!reduceMotion && visible) frame = window.requestAnimationFrame(draw);
      else frame = 0;
    };

    resize();
    draw(0);
    window.addEventListener("resize", resize);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible && !reduceMotion && frame === 0) frame = window.requestAnimationFrame(draw);
    });
    observer.observe(canvas);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
