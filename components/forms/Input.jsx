import React from 'react';

/**
 * Text input with label, helper, and error states.
 */
export function Input({
  label,
  helper,
  error,
  leadingIcon = null,
  size = 'md',
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const h = size === 'lg' ? 52 : size === 'sm' ? 38 : 46;
  const borderColor = error ? 'var(--status-danger)'
    : focus ? 'var(--brand-primary)' : 'var(--border-default)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-ui)', ...style }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>
          {label}
        </label>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: h, padding: '0 14px',
        background: 'var(--surface-card)',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus ? 'var(--ring-focus)' : 'none',
        transition: 'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)',
      }}>
        {leadingIcon && <span style={{ display: 'flex', color: 'var(--text-muted)' }}>{leadingIcon}</span>}
        <input
          id={inputId}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-ui)', fontSize: 'var(--text-base)',
            color: 'var(--text-body)', minWidth: 0,
          }}
          {...rest}
        />
      </div>
      {(helper || error) && (
        <span style={{ fontSize: 'var(--text-xs)', color: error ? 'var(--status-danger)' : 'var(--text-muted)' }}>
          {error || helper}
        </span>
      )}
    </div>
  );
}
