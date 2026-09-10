import styles from "./WebsiteDevelopmentFeature.module.css";

export function WebsiteDevelopmentFeatureVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.browserBar}>
        <div>
          <i />
          <i />
          <i />
        </div>
        <span>yourbusiness.com.au</span>
        <b>Live</b>
      </div>
      <div className={styles.websiteCanvas}>
        <nav>
          <strong>
            your<span>business</span>.
          </strong>
          <div>
            <i />
            <i />
            <b />
          </div>
        </nav>
        <div className={styles.pageHero}>
          <small>A clear path forward</small>
          <strong>
            Make the next
            <br />
            step obvious.
          </strong>
          <span>Get started →</span>
        </div>
        <div className={styles.pageCards}>
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className={styles.systemPanel}>
        <header>
          <span>Behind the website</span>
          <b>Working</b>
        </header>
        <div>
          <i>01</i>
          <span>Form routed</span>
          <strong>Done</strong>
        </div>
        <div>
          <i>02</i>
          <span>CRM updated</span>
          <strong>Done</strong>
        </div>
        <div>
          <i>03</i>
          <span>Follow-up sent</span>
          <strong>Done</strong>
        </div>
      </div>
    </div>
  );
}
