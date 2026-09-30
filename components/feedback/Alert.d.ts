import * as React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Status tone. @default "info" */
  tone?: 'info' | 'success' | 'warning' | 'danger';
  /** Bold heading line. */
  title?: string;
  /** Leading icon node. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/** Inline notice banner with a colored leading bar (kiosk notices, form messages). */
export function Alert(props: AlertProps): JSX.Element;
