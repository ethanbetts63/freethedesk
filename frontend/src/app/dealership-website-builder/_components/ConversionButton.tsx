'use client';

import {
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
} from 'react';

import { cn } from '@/lib/utils';

import styles from '../_styles/preview.module.css';

const PARTICLES = [
  ['-35px', '-28px', '-38deg'],
  ['-14px', '-40px', '22deg'],
  ['12px', '-42px', '70deg'],
  ['34px', '-26px', '120deg'],
  ['41px', '2px', '168deg'],
  ['28px', '25px', '215deg'],
  ['2px', '35px', '260deg'],
  ['-28px', '27px', '310deg'],
  ['-42px', '3px', '350deg'],
] as const;

function useConfettiBurst() {
  const [burst, setBurst] = useState(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  const trigger = () => {
    setBurst((current) => current + 1);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setBurst(0), 900);
  };

  return { burst, trigger };
}

// Three colours so adjacent particles read as separate pieces, all drawn from
// the palette rather than picked by eye.
const BURST_COLOURS = ['var(--action-primary)', 'var(--purple-accent)', 'var(--sky-500)'];

function ConfettiBurst({ burst }: { burst: number }) {
  if (!burst) return null;

  return (
    <span className={styles.confettiBurst} key={burst} aria-hidden="true">
      {PARTICLES.map(([x, y, rotation], index) => (
        <i
          key={index}
          style={
            {
              '--burst-x': x,
              '--burst-y': y,
              '--burst-rotation': rotation,
              '--burst-colour': BURST_COLOURS[index % BURST_COLOURS.length],
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

export function ConversionButton({
  className = '',
  onClick,
  type = 'button',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { burst, trigger: triggerBurst } = useConfettiBurst();

  const trigger: ButtonHTMLAttributes<HTMLButtonElement>['onClick'] = (event) => {
    if (type === 'submit' && event.currentTarget.form && !event.currentTarget.form.checkValidity())
      return;
    onClick?.(event);
    if (!event.defaultPrevented) triggerBurst();
  };

  return (
    <button
      {...props}
      type={type}
      className={cn(styles.conversionButton, className)}
      onClick={trigger}
    >
      {children}
      <ConfettiBurst burst={burst} />
    </button>
  );
}

export function ConversionLink({
  className = '',
  onClick,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { burst, trigger: triggerBurst } = useConfettiBurst();

  return (
    <a
      {...props}
      className={cn(styles.conversionLink, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) triggerBurst();
      }}
    >
      {children}
      <ConfettiBurst burst={burst} />
    </a>
  );
}
