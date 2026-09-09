import Image from "next/image";

import styles from "../_styles/preview.module.css";

/** The demo vehicle. object-fit: contain, so it letterboxes rather than stretching. */
export function VehicleArtwork({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      className={compact ? styles.vehicleArtworkCompact : styles.vehicleArtwork}
      src="/images/car.png"
      alt=""
      width={520}
      height={262}
      aria-hidden="true"
    />
  );
}

export function LandscapeArtwork() {
  return (
    <svg className={styles.landscapeArtwork} viewBox="0 0 120 80" aria-hidden="true">
      <circle cx="94" cy="18" r="11" />
      <path d="M0 80 35 25l20 28 17-22 48 49z" />
      <path d="M12 80 53 45l18 23 17-14 25 26z" opacity=".55" />
      <path className={styles.landscapeRoad} d="M54 80c8-17 11-29 10-38" />
    </svg>
  );
}

export function ProductArtwork({ variant }: { variant: number }) {
  const icons = [
    <path key="luggage" d="M24 29h52v41H24zM36 29v-9h28v9M35 39h30" />,
    <path key="bars" d="M24 65c4-30 14-44 26-44s22 14 26 44M31 48h38M50 21v49" />,
    <path key="seat" d="M18 56c13-19 35-28 66-25l-7 25c-20 9-39 10-59 0Z" />,
    <path key="cover" d="M17 65c4-30 21-45 50-45 10 12 15 27 16 45zM30 65v8m40-8v8" />,
    <path key="jacket" d="m33 22 17-8 17 8 14 17-12 9v30H31V48l-12-9zM50 14v64" />,
    <path key="care" d="M34 25h32v53H34zM42 15h16v10M40 42h20M45 52h10" />,
  ];

  return (
    <svg className={styles.productArtwork} viewBox="0 0 100 90" aria-hidden="true">
      {icons[(variant - 1) % icons.length]}
    </svg>
  );
}

export function BrandArtwork({ label }: { label: string }) {
  return (
    <svg className={styles.brandArtwork} viewBox="0 0 36 36" role="img" aria-label={`${label} logo`}>
      <circle cx="18" cy="18" r="15" />
      <path d="M9 22 18 9l9 13M13 18h10" />
    </svg>
  );
}
