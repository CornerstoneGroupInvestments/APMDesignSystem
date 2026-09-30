import React from 'react';

const sizes = {
  sm: { fontSize: 'var(--text-sm)', padding: '0 14px', height: 36, gap: 6 },
  md: { fontSize: 'var(--text-base)', padding: '0 20px', height: 44, gap: 8 },
  lg: { fontSize: 'var(--text-md)', padding: '0 28px', height: 52, gap: 10 },
};

const palette = {
  primary: {
    background: 'var(--brand-primary)', color: 'var(--brand-on-primary)',
    border: '1px solid transparent',
    hoverBg: 'var(--brand-primary-hover)', activeBg: 'var(--brand-primary-active)',
  },
  secondary: {
    background: 'var(--surface-card)', color: 'var(--brand-dark)',
    border: '1.5px solid var(--brand-dark)',
    hoverBg: 'var(--apm-navy-50)', activeBg: 'var(--neutral-100)',
  },
  ghost: {
    background: 'transparent', color: 'var(--brand-dark)',
    border: '1px solid transparent',
    hoverBg: 'var(--apm-navy-50)', activeBg: 'var(--neutral-100)',
  },
  danger: {
    background: 'var(--status-danger)', color: '#fff',
    border: '1px solid transparent',
    hoverBg: '#BC2F2F', activeBg: '#A52929',
  },
};

/**
 * APM primary action button. Pill-shaped, brand orange by default.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  leadingIcon = null,
  trailingIcon = null,
  children,
  style = {},
  ...rest
}) {
  const s = sizes[size] || sizes.md;
  const p = palette[variant] || palette.primary;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const bg = disabled ? 'var(--neutral-200)'
    : active ? p.activeBg : hover ? p.hoverBg : p.background;

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap, height: s.height, padding: s.padding,
        fontFamily: 'var(--font-ui)', fontSize: s.fontSize,
        fontWeight: 'var(--weight-semibold)', lineHeight: 1,
        background: bg,
        color: disabled ? 'var(--text-subtle)' : p.color,
        border: disabled ? '1px solid transparent' : p.border,
        borderRadius: 'var(--radius-pill)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        transition: 'background var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)',
        transform: active && !disabled ? 'scale(0.98)' : 'scale(1)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
