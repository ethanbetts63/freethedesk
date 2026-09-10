"use client";

import type { FormEventHandler, ReactNode } from "react";

import formStyles from "./SelectionForm.module.css";
import styles from "./SelectionFormPanel.module.css";

function classes(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(" ");
}

export function SelectionFormPanel({
  chooser,
  children,
  onSubmit,
  chooserClassName,
  formClassName,
}: {
  chooser: ReactNode;
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  chooserClassName?: string;
  formClassName?: string;
}) {
  return (
    <div className={classes(formStyles.panel, styles.panel)}>
      <aside className={classes(formStyles.chooser, styles.chooser, chooserClassName)}>{chooser}</aside>
      <form className={classes(formStyles.form, styles.form, formClassName)} onSubmit={onSubmit}>
        {children}
      </form>
    </div>
  );
}
