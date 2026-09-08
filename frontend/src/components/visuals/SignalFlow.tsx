"use client";

import { useCallback, useRef } from "react";

import { useCanvasAnimation, type CanvasFrame } from "./useCanvasAnimation";

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
  { y: 0.2, amplitude: 52, frequency: 1.45, phase: 0.2, speed: 0.000072, color: "rgba(35, 131, 207, .22)", width: 1 },
  { y: 0.28, amplitude: 84, frequency: 1.05, phase: 2.2, speed: -0.00006, color: "rgba(19, 49, 92, .28)", width: 1.2 },
  { y: 0.39, amplitude: 58, frequency: 1.75, phase: 4.1, speed: 0.00009, color: "rgba(91, 174, 232, .34)", width: 1 },
  {
    y: 0.52,
    amplitude: 100,
    frequency: 0.85,
    phase: 1.4,
    speed: -0.000048,
    color: "rgba(14, 77, 139, .2)",
    width: 1.4,
  },
  { y: 0.64, amplitude: 62, frequency: 1.3, phase: 3.3, speed: 0.000066, color: "rgba(63, 151, 218, .27)", width: 1 },
  { y: 0.76, amplitude: 74, frequency: 1.6, phase: 5.4, speed: -0.000078, color: "rgba(19, 49, 92, .2)", width: 1.2 },
];

const DOT_BLUR = 12;
const DOT_RADIUS = { dark: 3.8, light: 2.5 };

/** A pre-rendered glowing dot. Shadow blur is expensive, so it is paid once per resize. */
function createDotSprite(fillColor: string, shadowColor: string, radius: number, ratio: number) {
  const size = (radius + DOT_BLUR) * 2;
  const sprite = document.createElement("canvas");
  sprite.width = Math.ceil(size * ratio);
  sprite.height = Math.ceil(size * ratio);
  const context = sprite.getContext("2d");
  if (context) {
    context.scale(ratio, ratio);
    context.fillStyle = fillColor;
    context.shadowColor = shadowColor;
    context.shadowBlur = DOT_BLUR;
    context.beginPath();
    context.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
    context.fill();
  }
  return { canvas: sprite, size };
}

type Sprite = ReturnType<typeof createDotSprite>;

export function SignalFlow() {
  const sprites = useRef<{ dark: Sprite; light: Sprite } | null>(null);

  const onResize = useCallback(({ ratio }: { ratio: number }) => {
    sprites.current = {
      dark: createDotSprite("#13315c", "rgba(19, 49, 92, .28)", DOT_RADIUS.dark, ratio),
      light: createDotSprite("#3f97da", "rgba(63, 151, 218, .4)", DOT_RADIUS.light, ratio),
    };
  }, []);

  const draw = useCallback(({ context, width, height, time, reduceMotion }: CanvasFrame) => {
    context.clearRect(0, 0, width, height);

    const point = (stream: Stream, progress: number) => {
      const x = progress * (width + 240) - 120;
      const wave = Math.sin(progress * Math.PI * 2 * stream.frequency + stream.phase + time * stream.speed);
      const fineWave = Math.sin(progress * Math.PI * 6 + stream.phase) * 9;
      return { x, y: height * stream.y + wave * stream.amplitude + fineWave };
    };

    STREAMS.forEach((stream, streamIndex) => {
      context.beginPath();
      for (let step = 0; step <= 100; step += 1) {
        const position = point(stream, step / 100);
        if (step === 0) context.moveTo(position.x, position.y);
        else context.lineTo(position.x, position.y);
      }
      context.strokeStyle = stream.color;
      context.lineWidth = stream.width;
      context.stroke();

      const pulseCount = streamIndex % 2 === 0 ? 3 : 2;
      for (let pulse = 0; pulse < pulseCount; pulse += 1) {
        const raw = reduceMotion
          ? (pulse + 1) / (pulseCount + 1)
          : time * (0.000021 + streamIndex * 0.0000012) + pulse / pulseCount + streamIndex * 0.13;
        const position = point(stream, raw % 1);
        const sprite = sprites.current?.[(pulse + streamIndex) % 3 === 0 ? "dark" : "light"];
        if (!sprite) continue;
        const { size } = sprite;
        context.drawImage(sprite.canvas, position.x - size / 2, position.y - size / 2, size, size);
      }
    });
  }, []);

  const canvasRef = useCanvasAnimation({ draw, onResize });

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
