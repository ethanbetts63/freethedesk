import type { ReactNode } from "react";

import type { InventoryOptionDefinition, ModuleDefinition } from "../_lib/types";
import { CapabilityIcon } from "./CapabilityIcon";
import styles from "../_styles/configurator.module.css";

type CapabilityOptionProps = {
  option: ModuleDefinition | InventoryOptionDefinition;
  selected: boolean;
  expanded: boolean;
  compact?: boolean;
  onToggle: () => void;
  onExpandedChange: () => void;
  children?: ReactNode;
};

export function CapabilityOption({
  option,
  selected,
  expanded,
  compact = false,
  onToggle,
  onExpandedChange,
  children,
}: CapabilityOptionProps) {
  const explanationId = `${compact ? "inventory" : "module"}-${option.key}`;
  const selectedClass = selected ? (compact ? styles.subOptionSelected : styles.moduleSelected) : "";

  return (
    <div className={compact ? styles.subOption : styles.moduleChoice}>
      <div className={styles.moduleRow}>
        <button
          type="button"
          className={`${styles.moduleToggle} ${selectedClass}`}
          onClick={onToggle}
          aria-pressed={selected}
        >
          <span className={styles.capabilityLabel}>
            <span className={`${styles.capabilityIcon} ${compact ? styles.subCapabilityIcon : ""}`}>
              <CapabilityIcon type={option.key} />
            </span>
            <span>
              <strong>{option.name}</strong>
              <small>{option.description}</small>
            </span>
          </span>
          <i>{selected ? "✓" : "+"}</i>
        </button>
        <button
          type="button"
          className={`${styles.expandToggle} ${expanded ? styles.expandToggleOpen : ""}`}
          onClick={onExpandedChange}
          aria-expanded={expanded}
          aria-controls={`${explanationId}-details`}
          aria-label={`${expanded ? "Hide" : "Learn more about"} ${option.name}`}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div
          className={`${styles.moduleExplanation} ${compact ? styles.subExplanation : ""}`}
          id={`${explanationId}-details`}
        >
          <p>{option.detail}</p>
          <ul>
            {option.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </div>
  );
}
