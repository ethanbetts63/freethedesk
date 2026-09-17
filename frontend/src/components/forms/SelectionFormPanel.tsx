'use client';

import type { FormEventHandler, ReactNode } from 'react';

import { chooserClassName, formClassName as sharedFormClassName } from './selectionFormClassNames';
import { selectionPanelClassName } from './selectionFormClassNames';
import { cn } from '@/lib/utils';

function classes(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(' ');
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
      className={cn(
        selectionPanelClassName,
        // A negative page gutter, derived from --gutter itself: the panel bleeds to
        // the screen edge below sm.
        // eslint-disable-next-line no-restricted-syntax -- token read, not a literal
        'mx-[calc(var(--gutter)*-1)] [--selection-input-font-size:1rem] [--selection-panel-min-height:560px] [--selection-total-size:2.4rem] sm:mx-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]',
      )}
    >
      <aside className={classes(chooserClassName, chooserClassNameProp)}>{chooser}</aside>
      <form
        className={classes(
          sharedFormClassName,
          'lg:border-t-0 lg:border-l lg:border-l-border-subtle',
          formClassNameProp,
        )}
        onSubmit={onSubmit}
      >
        {children}
      </form>
    </div>
  );
}
