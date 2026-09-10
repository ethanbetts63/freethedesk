import { SectionNumber } from "./SectionNumber";
import type { Service } from "./ServiceScroll";
import "./ExpandableServiceList.css";

export function ExpandableServiceList({
  services,
  eyebrow,
  title,
  description,
  id,
}: {
  services: readonly Service[];
  eyebrow: string;
  title: string;
  description: string;
  id?: string;
}) {
  return (
    <section className="expandable-services shell" id={id}>
      <header className="expandable-services-heading">
        <SectionNumber>{eyebrow}</SectionNumber>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="expandable-services-list">
        {services.map((service, index) => (
          <details key={service.title} open={index === 0}>
            <summary>
              <span className="expandable-services-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="expandable-services-icon" style={{ color: service.color }} aria-hidden="true">
                {service.icon}
              </span>
              <span className="expandable-services-summary">
                <strong>{service.title}</strong>
                <small>{service.body}</small>
              </span>
              <span className="expandable-services-toggle" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="expandable-services-body">
              <p>Examples of what we check</p>
              <ul>
                {service.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
