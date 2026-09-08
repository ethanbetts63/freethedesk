"use client";

import Image from "next/image";

import { SignalFlow } from "@/components/visuals/SignalFlow";
import styles from "../page.module.css";

/** Decorative phone mockup showing the real, live login-page background so the portal feels tangible next to the copy. */
export function LoginPreviewPhone() {
  return (
    <div className={styles.phoneMock} aria-hidden="true">
      <div className={styles.phoneMockNotch} />
      <div className={styles.phoneMockScreen}>
        <div className={styles.loginPhoneNetwork}>
          <SignalFlow />
        </div>
        <div className={styles.loginPhoneGrid} />
        <div className={styles.loginPhoneCard}>
          <p className={styles.loginPhoneBrand}>
            <Image className={styles.loginPhoneBrandImage} src="/logo-192x192.png" alt="" width={16} height={16} />
            <span className={styles.loginPhoneBrandText}>
              free<span>the</span>desk<b>.</b>
            </span>
          </p>
          <p className={styles.loginPhoneHeading}>Welcome back</p>
          <div className={styles.loginPhoneField} />
          <div className={styles.loginPhoneField} />
          <div className={styles.loginPhoneButton}>Sign in</div>
        </div>
      </div>
      <div className={styles.phoneMockHomebar} />
    </div>
  );
}
