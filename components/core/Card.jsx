import React from 'react';

/**
 * Surface container with soft elevation. Optional interactive hover lift.
 */
export function Card({
  interactive = false,
  padding = 'var(--space-6)',
  elevation = 'sm',
  children,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const shadow = { none: 'none', sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' };
  return (
    <div
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding,
        boxShadow: interactive && hover ? 'var(--shadow-lg)' : shadow[elevation],
        transition: 'box-shadow var(--duration-base) var(--ease-standard), transform var(--duration-base) var(--ease-standard)',
        transform: interactive && hover ? 'translateY(-2px)' : 'none',
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
