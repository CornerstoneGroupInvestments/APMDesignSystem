import * as React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field label shown above the control. */
  label?: string;
  /** Helper text below the field. */
  helper?: string;
  /** Error message; turns the field red and replaces helper. */
  error?: string;
  /** Icon node rendered inside, before the text. */
  leadingIcon?: React.ReactNode;
  /** Control height. @default "md" */
  size?: 'sm' | 'md' | 'lg';
}

/** Labelled text input with helper / error states and orange focus ring. */
export function Input(props: InputProps): JSX.Element;
