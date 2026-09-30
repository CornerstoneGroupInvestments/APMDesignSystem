# YubiKey research notes (for DDD build)
- YubiKey 5C NFC FIPS fw 5.4.3 = FIPS 140-2 (Overall L1+L2, Physical Security L3). AAGUID (5 FIPS Series with NFC): c1f9a0bc-1dd2-404a-b27f-8e29047a43fd
- YubiKey 5C NFC FIPS fw 5.7.4 = FIPS 140-3 certified 22 May 2026 (Overall L2, Physical Security L3). "FIPS 140-3" printed near 2D barcode; fw 5.4.3 keys have "v5".
- 140-2 (5.4.x) moved to NIST Sunset List May 2026; all FIPS 140-2 to Historical List 22 Sep 2026 → procurement should prefer 5.7.4 stock.
- Meets NIST SP 800-63B AAL3.
- fw 5.7.4: FIDO2 min PIN length 8, PIN complexity enforced by default, U2F permanently disabled, 100 discoverable credentials (25 on 5.4.3), enterprise attestation support.
- FIDO2 PIN: 8 consecutive wrong attempts (with power cycles) blocks FIDO2 application until reset (credentials destroyed).
- AAGUID allow-list: Entra Authentication methods policy > Passkey (FIDO2) > Key restrictions (Enforce attestation = Yes; Restrict specific keys = Allow). Include both 5 FIPS Series w/ NFC AAGUIDs (140-2 value above; 140-3 fw 5.7.4 AAGUID to be confirmed from Yubico AAGUID register / FIDO MDS at build time - record as verification task).
- Yubico allow-list example also cites 85203421-48f9-4355-9bc8-8a53846e5083 (5Ci FIPS).
