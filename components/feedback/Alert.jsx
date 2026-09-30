import React from 'react';

const tones = {
  info:    { bar: 'var(--status-info)', bg: 'var(--status-info-bg)', fg: 'var(--apm-navy-700)' },
  success: { bar: 'var(--status-success)', bg: 'var(--status-success-bg)', fg: 'var(--apm-navy-700)' },
  warning: { bar: 'var(--status-warning)', bg: 'var(--status-warning-bg)', fg: 'var(--apm-navy-700)' },
  danger:  { bar: 'var(--status-danger)', bg: 'var(--status-danger-bg)', fg: 'var(--apm-navy-700)' },
};

/**
 * Inline notice banner with a leading status bar. Use for kiosk notices
 * (e.g. the data-wipe warning) and form-level messages.
 */
export function Alert({ tone = 'info', title, icon = null, children, style = {}, ...rest }) {
  const t = tones[tone] || tones.info;
  return (
    <div
      role="status"
      style={{
        display: 'flex', gap: 12,
        padding: '14px 16px',
        background: t.bg,
        borderRadius: 'var(--radius-md)',
        borderLeft: `4px solid ${t.bar}`,
        fontFamily: 'var(--font-ui)', color: t.fg,
        ...style,
      }}
      {...rest}
    >
      {icon && <span style={{ display: 'flex', color: t.bar, flexShrink: 0, marginTop: 1 }}>{icon}</span>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {title && <strong style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--text-strong)' }}>{title}</strong>}
        {children && <span style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>{children}</span>}
      </div>
    </div>
  );
}
