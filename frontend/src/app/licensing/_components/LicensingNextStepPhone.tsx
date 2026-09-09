import styles from "../page.module.css";

export function LicensingNextStepPhone() {
  return (
    <div className={styles.phoneMock} aria-hidden="true">
      <div className={styles.phoneMockNotch} />
      <div className={styles.phoneMockScreen}>
        <div className={styles.successPhoneHeader}>
          <i />
          <i />
          <i />
          <span>Your Business</span>
        </div>
        <div className={styles.successPhoneBody}>
          <div className={styles.successPhoneCheck}>✓</div>
          <h4>Payment successful</h4>
          <p>Order #4821 is confirmed.</p>
          <div className={styles.successPhoneNext}>
            <span>Next step</span>
            <strong>
              Online licensing <span>→</span>
            </strong>
          </div>
        </div>
      </div>
      <div className={styles.phoneMockHomebar} />
    </div>
  );
}
