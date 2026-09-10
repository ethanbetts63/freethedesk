import styles from "./AutomationFeature.module.css";

export function AutomationFeatureVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <header>
        <span>Workflow / 01</span>
        <b>
          <i /> Running
        </b>
      </header>
      <div className={styles.event}>
        <small>Trigger</small>
        <strong>New enquiry received</strong>
        <span>Customer + product context attached</span>
      </div>
      <div className={styles.route}>
        <i />
        <i />
        <i />
      </div>
      <div className={styles.actions}>
        <article>
          <span>01</span>
          <strong>CRM updated</strong>
          <small>No re-keying</small>
        </article>
        <article>
          <span>02</span>
          <strong>Team notified</strong>
          <small>Right person, instantly</small>
        </article>
        <article>
          <span>03</span>
          <strong>Follow-up queued</strong>
          <small>Nothing forgotten</small>
        </article>
      </div>
      <footer>
        <span>Manual touches</span>
        <strong>0</strong>
        <small>Workflow complete</small>
      </footer>
    </div>
  );
}
