Labelled text input with helper text, error state, and orange focus ring.

```jsx
<Input label="Username" placeholder="kiosk-CU9G7H2@apm.net.au" />
<Input label="Password" type="password" error="Incorrect password" />
```

Props: `label`, `helper`, `error` (overrides helper, turns red), `leadingIcon`, `size` (`sm`/`md`/`lg`). Forwards all native input attributes.
