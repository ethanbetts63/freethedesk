import styles from "./WebsiteJobsBar.module.css";

const jobs = ["Get found", "Get customers", "Get time back"] as const;

export function WebsiteJobsBar({ id = "website-hero-end" }: { id?: string }) {
  return (
    <section className={styles.section} id={id} aria-label="Three jobs your website should do">
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
