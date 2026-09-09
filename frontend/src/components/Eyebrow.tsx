export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`eyebrow ${className}`.trim()}>
      <span />
      {children}
    </p>
  );
}
