import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds hover lift + pointer cursor. @default false */
  interactive?: boolean;
  /** CSS padding value. @default "var(--space-6)" */
  padding?: string;
  /** Resting shadow depth. @default "sm" */
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

/**
 * White surface container with soft navy-tinted elevation and 16px radius.
 * @startingPoint section="Core" subtitle="Elevated surface container" viewport="700x220"
 */
export function Card(props: CardProps): JSX.Element;
