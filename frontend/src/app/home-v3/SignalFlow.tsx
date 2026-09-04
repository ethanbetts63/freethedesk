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
  { y: .20, amplitude: 52, frequency: 1.45, phase: .2, speed: .00012, color: "rgba(35, 131, 207, .22)", width: 1 },
  { y: .28, amplitude: 84, frequency: 1.05, phase: 2.2, speed: -.0001, color: "rgba(19, 49, 92, .28)", width: 1.2 },
  { y: .39, amplitude: 58, frequency: 1.75, phase: 4.1, speed: .00015, color: "rgba(91, 174, 232, .34)", width: 1 },
  { y: .52, amplitude: 100, frequency: .85, phase: 1.4, speed: -.00008, color: "rgba(14, 77, 139, .2)", width: 1.4 },
  { y: .64, amplitude: 62, frequency: 1.3, phase: 3.3, speed: .00011, color: "rgba(63, 151, 218, .27)", width: 1 },
  { y: .76, amplitude: 74, frequency: 1.6, phase: 5.4, speed: -.00013, color: "rgba(19, 49, 92, .2)", width: 1.2 },
];

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
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
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
          const raw = reduceMotion ? (pulse + 1) / (pulseCount + 1) : time * (.000035 + streamIndex * .000002) + pulse / pulseCount + streamIndex * .13;
          const position = point(stream, raw % 1, time);
          const dark = (pulse + streamIndex) % 3 === 0;

          context.fillStyle = dark ? "#13315c" : "#3f97da";
          context.shadowColor = dark ? "rgba(19, 49, 92, .28)" : "rgba(63, 151, 218, .4)";
          context.shadowBlur = 12;
          context.beginPath();
          context.arc(position.x, position.y, dark ? 3.8 : 2.5, 0, Math.PI * 2);
          context.fill();
          context.shadowBlur = 0;
        }
      });

      if (!reduceMotion) frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw(0);
    window.addEventListener("resize", resize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
