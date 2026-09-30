import React from 'react';

const tones = {
  neutral: { bg: 'var(--neutral-100)', fg: 'var(--neutral-700)', dot: 'var(--neutral-500)' },
  brand:   { bg: 'var(--apm-orange-50)', fg: 'var(--apm-orange-800)', dot: 'var(--apm-orange-500)' },
  navy:    { bg: 'var(--apm-navy-50)', fg: 'var(--apm-navy-700)', dot: 'var(--apm-navy-600)' },
  success: { bg: 'var(--status-success-bg)', fg: 'var(--status-success)', dot: 'var(--status-success)' },
  warning: { bg: 'var(--status-warning-bg)', fg: '#9A6206', dot: 'var(--status-warning)' },
  danger:  { bg: 'var(--status-danger-bg)', fg: 'var(--status-danger)', dot: 'var(--status-danger)' },
  info:    { bg: 'var(--status-info-bg)', fg: 'var(--status-info)', dot: 'var(--status-info)' },
};

/**
 * Small status / category label.
 */
export function Badge({ tone = 'neutral', dot = false, children, style = {}, ...rest }) {
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 24, padding: '0 10px',
        fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-bold)', letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: t.fg, background: t.bg,
        borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot }} />}
      {children}
    </span>
  );
}
