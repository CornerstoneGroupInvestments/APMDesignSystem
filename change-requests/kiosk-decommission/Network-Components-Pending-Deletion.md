# Kiosk Decommissioning - Azure Network Components Pending Deletion

Source: CR-Kiosk-Decommissioning.md, section 2b

| Component | What it is | Action |
|---|---|---|
| Log Analytics workspace (kiosk) | Telemetry sink for the credential pipeline | Export evidence, then delete. Build a fresh, schema-named workspace for AVD rather than renaming this one |
| NSG nsg-avd-session-hosts | Session host subnet NSG, kiosk ruleset | Delete. Build a fresh NSG with rules written for Standard User AVD SOE's traffic pattern |
| NSG nsg-avd-pe | Private endpoint subnet NSG, kiosk ruleset | Delete. Build fresh |
| Kiosk-specific route table | Forces kiosk subnet traffic through the credential-pipeline path | Delete. Build fresh for the new subnet design |
| NAT gateway (if provisioned) | Stable egress IP for the credential pipeline | Delete if no AVD spoke wants it. Confirm first |

## Kept, not deleted

| Component | Action |
|---|---|
| Hub/spoke VNet and subnet allocation (Australia East) | Keep. Audit every rule and route inside it, rename to schema |
