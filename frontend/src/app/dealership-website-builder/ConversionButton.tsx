"use client";

import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type CSSProperties } from "react";

import styles from "./page.module.css";

const PARTICLES = [
  ["-35px", "-28px", "-38deg", "var(--preview-accent)"],
  ["-14px", "-40px", "22deg", "color-mix(in srgb, var(--preview-accent) 55%, white)"],
  ["12px", "-42px", "70deg", "#13315c"],
  ["34px", "-26px", "120deg", "var(--preview-accent)"],
  ["41px", "2px", "168deg", "color-mix(in srgb, var(--preview-accent) 55%, white)"],
  ["28px", "25px", "215deg", "#13315c"],
  ["2px", "35px", "260deg", "var(--preview-accent)"],
  ["-28px", "27px", "310deg", "color-mix(in srgb, var(--preview-accent) 55%, white)"],
  ["-42px", "3px", "350deg", "#13315c"],
] as const;

function useConversionBurst() {
  const [burst, setBurst] = useState(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);

  const trigger = () => {
    setBurst((current) => current + 1);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setBurst(0), 1150);
  };

  return { burst, trigger };
}

function SuccessEffect({ burst }: { burst: number }) {
  if (!burst) return null;

  return <><span className={styles.successBurst} key={burst} aria-hidden="true"><b>✓</b>{PARTICLES.map(([x, y, rotation, colour], index) => <i key={index} style={{ "--burst-x": x, "--burst-y": y, "--burst-rotation": rotation, "--burst-colour": colour } as CSSProperties} />)}</span><span className={styles.srOnly} aria-live="polite">Action successful</span></>;
}

export function ConversionButton({ className = "", onClick, type = "button", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { burst, trigger: triggerBurst } = useConversionBurst();

  const trigger: ButtonHTMLAttributes<HTMLButtonElement>["onClick"] = (event) => {
    if (type === "submit" && event.currentTarget.form && !event.currentTarget.form.checkValidity()) return;
    onClick?.(event);
    if (event.defaultPrevented) return;
    triggerBurst();
  };

  return (
    <button {...props} type={type} className={`${styles.conversionButton} ${burst ? styles.conversionSuccess : ""} ${className}`} onClick={trigger}>
      <span className={styles.conversionLabel}>{children}</span>
      <SuccessEffect burst={burst} />
    </button>
  );
}

export function ConversionLink({ className = "", onClick, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { burst, trigger: triggerBurst } = useConversionBurst();

  return <a {...props} className={`${styles.conversionLink} ${burst ? styles.conversionSuccess : ""} ${className}`} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) triggerBurst(); }}><span className={styles.conversionLabel}>{children}</span><SuccessEffect burst={burst} /></a>;
}
