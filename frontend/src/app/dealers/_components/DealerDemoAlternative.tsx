import Link from "next/link";

import styles from "./DealerDemoAlternative.module.css";

export function DealerDemoAlternative() {
  return (
    <p className={styles.alternative}>
      <span>or</span>
      <Link href="/dealership-website-builder">Try the dealer demo ↗</Link>
    </p>
  );
}
