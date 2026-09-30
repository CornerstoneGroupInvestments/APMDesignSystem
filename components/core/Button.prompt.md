Pill-shaped action button in APM brand orange — use for primary and secondary actions across kiosk and product UI.

```jsx
<Button variant="primary" size="lg" onClick={start}>Get started</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost" size="sm">Skip</Button>
```

Variants: `primary` (orange, navy text), `secondary` (navy outline), `ghost` (transparent), `danger` (red). Sizes `sm` (36px) / `md` (44px) / `lg` (52px). Supports `leadingIcon` / `trailingIcon`, `fullWidth`, `disabled`. All sizes ≥ accessible hit targets at md/lg.
