<#
.SYNOPSIS
    Stages the approved participant wallpaper to the local path referenced by the
    PersonalizationCSP DesktopImageUrl configuration profile.

.DESCRIPTION
    Copies wallpaper-participant-v5.2.png (packaged alongside this script in the same
    .intunewin) to C:\APM\PK\wallpaper.png and sets read-only ACLs so the participant
    session cannot replace it. The Intune Custom profile then points
    ./Vendor/MSFT/Personalization/DesktopImageUrl at that path (Detailed Design 5.2.6).

.NOTES
    Runs as SYSTEM, 64-bit. Sign with the APM code-signing certificate (SOE-02).
    Win32 app detection rule: file C:\APM\PK\wallpaper.png exists.
#>
$ErrorActionPreference = 'Stop'
$dir = 'C:\APM\PK'
$dest = Join-Path $dir 'wallpaper.png'
$srcName = 'wallpaper-participant-v5.2.png'
$src = Join-Path $PSScriptRoot $srcName

if (-not (Test-Path $dir)) { New-Item -Path $dir -ItemType Directory -Force | Out-Null }
if (-not (Test-Path $src)) { throw "Source image $srcName not found beside this script" }

Copy-Item -Path $src -Destination $dest -Force

# read-only for Users, full control for SYSTEM and Administrators
$acl = Get-Acl $dest
$acl.SetAccessRuleProtection($true, $false)
foreach ($rule in @(
    (New-Object System.Security.AccessControl.FileSystemAccessRule('SYSTEM','FullControl','Allow')),
    (New-Object System.Security.AccessControl.FileSystemAccessRule('Administrators','FullControl','Allow')),
    (New-Object System.Security.AccessControl.FileSystemAccessRule('Users','Read','Allow'))
)) { $acl.AddAccessRule($rule) }
Set-Acl -Path $dest -AclObject $acl

Write-Output "Wallpaper staged to $dest"
exit 0
