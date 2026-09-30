import React from 'react';

const sizes = { sm: 32, md: 40, lg: 48 };

/**
 * Square icon-only button. Pass an SVG/icon node as children.
 */
export function IconButton({ variant = 'ghost', size = 'md', label, disabled = false, children, style = {}, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const dim = sizes[size] || sizes.md;
  const filled = variant === 'filled';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: dim, height: dim,
        background: filled
          ? (hover ? 'var(--brand-primary-hover)' : 'var(--brand-primary)')
          : (hover ? 'var(--apm-navy-50)' : 'transparent'),
        color: filled ? 'var(--brand-on-primary)' : 'var(--brand-dark)',
        border: 'none', borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background var(--duration-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
