"use client";

import type { FormEventHandler, ReactNode } from "react";

import formStyles from "./SelectionForm.module.css";
import { chooserClassName, formClassName as sharedFormClassName } from "./selectionFormClassNames";

function classes(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(" ");
}

export function SelectionFormPanel({
  chooser,
  children,
  onSubmit,
  chooserClassName: chooserClassNameProp,
  formClassName: formClassNameProp,
}: {
  chooser: ReactNode;
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  chooserClassName?: string;
  formClassName?: string;
}) {
  return (
    <div
      className={`${formStyles.panel} mx-[calc(var(--gutter)*-1)] [--selection-input-font-size:1rem] [--selection-panel-min-height:560px] [--selection-total-size:2.4rem] sm:mx-0 min-[1080px]:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]`}
    >
      <aside className={classes(chooserClassName, chooserClassNameProp)}>{chooser}</aside>
      <form
        className={classes(
          sharedFormClassName,
          "min-[1080px]:border-t-0 min-[1080px]:border-l min-[1080px]:border-l-border-subtle",
          formClassNameProp,
        )}
        onSubmit={onSubmit}
      >
        {children}
      </form>
    </div>
  );
}
