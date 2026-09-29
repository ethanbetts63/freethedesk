/* Component registry: freetheplatform/frontend/registry/src/components/common/SignaturePad.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * A drawn-signature pad exported as a PNG data URL. The canvas is transparent because the PNG is stamped onto PDF
 * forms and a white rectangle would blot out their ruling. Pointer events only; the backing store is scaled by devicePixelRatio.
 */
export function SignaturePad({
  onChange,
  disabled = false,
  clearLabel = 'Clear',
  emptyPrompt = 'Sign here',
}: {
  /** Fired with a PNG data URL after each stroke, and with null on clear. */
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
  clearLabel?: string;
  emptyPrompt?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  // Sized from the rendered size, again on resize; a resize clears the drawing because rescaling would distort it.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const fit = () => {
      const ratio = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(width * ratio));
      const nextHeight = Math.max(1, Math.round(height * ratio));
      if (canvas.width === nextWidth && canvas.height === nextHeight) return;
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.scale(ratio, ratio);
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        // Pen ink is stamped into PDFs, so it must be this colour in every theme.
        // eslint-disable-next-line no-restricted-syntax -- pen ink, not themed UI
        context.strokeStyle = '#1a2b3c';
      }
      setHasInk(false);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    lastPoint.current = point(event);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || disabled) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const from = lastPoint.current;
    if (!canvas || !context || !from) return;
    const to = point(event);
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    lastPoint.current = to;
    if (!hasInk) setHasInk(true);
  };

  const finish = useCallback(() => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPoint.current = null;
    const canvas = canvasRef.current;
    if (canvas && hasInk) onChange(canvas.toDataURL('image/png'));
  }, [hasInk, onChange]);

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Signature pad"
        className={cn(
          'h-32 w-full touch-none rounded-md border border-border-strong bg-surface-page',
          disabled && 'cursor-not-allowed opacity-60',
        )}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
        onPointerLeave={finish}
      />
      {!hasInk && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-body-sm text-text-muted">
          {emptyPrompt}
        </span>
      )}
      <button
        type="button"
        onClick={clear}
        disabled={disabled || !hasInk}
        className="absolute right-2 top-2 rounded px-2 py-0.5 text-body-sm text-text-muted underline hover:text-text-primary disabled:invisible"
      >
        {clearLabel}
      </button>
    </div>
  );
}
