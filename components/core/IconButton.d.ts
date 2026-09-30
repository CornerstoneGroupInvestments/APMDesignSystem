import * as React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "ghost" */
  variant?: 'ghost' | 'filled';
  /** Square size. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label (also used as tooltip). */
  label: string;
  children?: React.ReactNode;
}

/** Square icon-only button; pass an icon node as children. */
export function IconButton(props: IconButtonProps): JSX.Element;
