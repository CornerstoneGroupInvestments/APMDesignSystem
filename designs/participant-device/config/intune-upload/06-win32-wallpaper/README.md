# 06 - Win32 app: Participant wallpaper

**Batch, not PowerShell.** The PowerShell version could not work on this fleet and is superseded. Two reasons, both already proven here: App Control leaves no runnable PowerShell option in SYSTEM context (unsigned is blocked by policy, signed will not load into a ConstrainedLanguage host), and it used `New-Object System.Security.AccessControl.FileSystemAccessRule`, which Constrained Language Mode blocks outright. So even where it ran, it could not set the ACL.

## Package contents

```
Install-KioskWallpaper.bat
wallpaper-participant-v5.1.png
```

The image must be **inside** the package. Nothing is fetched from a share.

```
IntuneWinAppUtil.exe -c <folder> -s Install-KioskWallpaper.bat -o <output>
```

## Intune settings

Name: `CDG-W11-CFG-Wallpaper-P-1.0`

| Field | Value |
|---|---|
| Install command | `Install-KioskWallpaper.bat` |
| Uninstall command | `Install-KioskWallpaper.bat UNINSTALL` |
| Install behaviour | System |
| Assignment | `sg-dyn-dvc-cdg-participant-kiosk` |

**Detection rule: registry, not file.**

| Field | Value |
|---|---|
| Rule type | Registry |
| Key path | `HKEY_LOCAL_MACHINE\SOFTWARE\APM\ParticipantKiosk` |
| Value name | `WallpaperVersion` |
| Detection method | String comparison, Equals, `5.1` |
| Associated with a 32-bit app on 64-bit clients | No |

**Do not use the old file-exists rule on `C:\APM\PK\wallpaper.png`.** The installer copies the image before it applies the ACL, so a file rule reports installed on a device where the ACL failed and the participant can replace the wallpaper. The marker is written only after the copy, the size check and the ACL have all succeeded.

## Three defects this rewrite fixes

1. **The reinstall could not overwrite its own file.** The ACL removes inheritance and denies Users write access. On a device where the app had already run, a plain copy over the existing file failed with access denied, so a version bump appeared to do nothing. The installer now hands the file back to Administrators before overwriting.
2. **The ACL step could not run at all** under Constrained Language Mode, so the wallpaper was staged world-writable on any device where the copy succeeded.
3. **The registry marker would have landed in `WOW6432Node`** had one existed, because Intune runs the install command 32-bit. The installer relaunches through `Sysnative` first.

## PersonalizationCSP caches, and that matters for artwork changes

The CSP records what it applied under `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\PersonalizationCSP`. If `DesktopImageStatus` is already 1 for the same path, Windows does not re-read the file, so **a new image at the same path can be ignored**.

When the artwork changes, change the file name and the `DesktopImageUrl` in the Personalization profile together. Do not overwrite `wallpaper.png` in place and expect devices to pick it up.

It also applies at logon, so a restart is the reliable test.

## Verification

```
reg query "HKLM\SOFTWARE\APM\ParticipantKiosk" /v WallpaperVersion
icacls C:\APM\PK\wallpaper.png
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\PersonalizationCSP"
```

`icacls` must show no write grant for `BUILTIN\Users`. The installer warns if one is present rather than trusting its own exit code.
