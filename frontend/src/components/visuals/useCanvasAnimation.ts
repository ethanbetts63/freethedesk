"use client";

import { useEffect, useRef } from "react";

export interface CanvasFrame {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
                                                  
  time: number;
                                                                               
  reduceMotion: boolean;
}

interface Options {
                                                                                
  draw: (frame: CanvasFrame) => void;
                                                                          
  onResize?: (size: { width: number; height: number; ratio: number }) => void;
                                            
  resizeDelay?: number;
}

   
                                                                               
                                                                              
                                                                              
   
export function useCanvasAnimation({ draw, onResize, resizeDelay = 150 }: Options) {
  const canvasRef = useRef<HTMLCanvasElement>(null);



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
