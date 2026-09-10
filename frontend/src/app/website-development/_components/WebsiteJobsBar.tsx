import styles from "./WebsiteJobsBar.module.css";

const jobs = ["Get found", "Get customers", "Get time back"] as const;

export function WebsiteJobsBar() {
  return (
    <section className={styles.section} id="website-hero-end" aria-label="Three jobs your website should do">
      <div className="shell">
        <ol className={styles.steps}>
          {jobs.map((job) => (
            <li key={job}>
              <span className={job === "Get time back" ? "moving-colour-text" : undefined}>{job}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
