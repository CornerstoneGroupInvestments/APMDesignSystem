# Job Seeker Kiosk - configuration artefacts

Configuration this design defines, exported for the build team. These are inputs to the build, not documentation - the design that specifies them is `../content.txt` (§5.2 Image Configuration and §5.3.4 Zscaler Tenant Configuration).

| File | What it is |
|---|---|
| `Kiosk_Edge_Zscaler_Allow.xml` | Microsoft Edge policy XML - the kiosk URL allow-list reconciled against the Zscaler ZIA policy |
| `Kiosk_Edge_Zscaler_Allow.csv` | The same allow-list in tabular form, for review |
| `Kiosk_Edge_Zscaler_Allow_Kiosk01.xml` | Per-variant allow-list export (kiosk profile 01) |
| `Kiosk_Edge_Zscaler_Allow_Kiosk02.xml` | Per-variant allow-list export (kiosk profile 02) |
| `Kiosk_Edge_Zscaler_Allow_Kiosk03.xml` | Per-variant allow-list export (kiosk profile 03) |

Keep these in step with the Managed Favourites and URL filtering tables in the design. If the design changes an allowed destination and these do not change, the build silently diverges from the approved document.
