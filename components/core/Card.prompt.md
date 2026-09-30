White surface container — the default grouping primitive. 16px radius, soft navy-tinted shadow.

```jsx
<Card><h3>Job search</h3><p>Find and apply for roles.</p></Card>
<Card interactive elevation="md" onClick={open}>…</Card>
```

`interactive` adds a hover lift; `elevation` sets resting shadow (`none`/`sm`/`md`/`lg`); `padding` overrides the default 24px.
