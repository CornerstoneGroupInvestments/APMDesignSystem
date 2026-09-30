import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color tone. @default "neutral" */
  tone?: 'neutral' | 'brand' | 'navy' | 'success' | 'warning' | 'danger' | 'info';
  /** Show a leading status dot. @default false */
  dot?: boolean;
  children?: React.ReactNode;
}

/** Small uppercase status / category label. */
export function Badge(props: BadgeProps): JSX.Element;
