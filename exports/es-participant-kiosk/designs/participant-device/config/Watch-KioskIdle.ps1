<#
.SYNOPSIS
    Participant Kiosk inactivity watchdog. Restarts the device after 600 seconds with no
    keyboard or mouse input in the participant session.

.DESCRIPTION
    Runs in the interactive participant session (Kiosk-<SERIAL>), launched every 30 seconds
    by the scheduled task APM-PK-IdleWatchdog. Polls Win32 GetLastInputInfo, which returns
    the true input time only when called from the interactive session, not from SYSTEM.

    Behaviour: arms on the first input event of a session so an untouched device does not
    restart in a loop, warns full-screen at 540 seconds with a live one-second countdown
    held on screen for the whole final 60, closes as soon as real input resumes, and at
    600 seconds runs shutdown /r /t 0 /f. The restart
    triggers CDG-W11-REM-Profile Purge-P-1.0.

.NOTES
    MUST be signed with the APM code-signing certificate (SOE-02) BEFORE it is packaged.
    The scheduled task launches it with -ExecutionPolicy AllSigned, so an unsigned copy
    does not run and the ten-minute purge claimed on the participant wallpaper is not met.
    Deployed by Install-KioskIdleWatchdog.ps1, which copies this file to C:\APM\PK\ and
    refuses to continue if its signature is not valid.
    Values per the Detailed Design, 4.3.2. Runs as the interactive user, 64-bit.
#>
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class Idle {
    [StructLayout(LayoutKind.Sequential)] struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }
    [DllImport("user32.dll")] static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
    [DllImport("kernel32.dll")] static extern uint GetTickCount();
    public static uint Seconds() {
        LASTINPUTINFO lii = new LASTINPUTINFO();
        lii.cbSize = (uint)Marshal.SizeOf(lii);
        if (!GetLastInputInfo(ref lii)) return 0;
        return (GetTickCount() - lii.dwTime) / 1000;
    }
}
"@
$script:thresholdSeconds = 600
$script:warnAtSeconds    = 540
$armFlag = Join-Path $env:TEMP 'apm-pk-idle-armed'

$idle = [Idle]::Seconds()

# Arm on the first input event of a session: an untouched device must not restart in a loop
if (-not (Test-Path $armFlag)) {
    if ($idle -lt 30) { New-Item -Path $armFlag -ItemType File -Force | Out-Null }
    return
}

if ($idle -ge $script:thresholdSeconds) {
    Remove-Item $armFlag -Force -ErrorAction SilentlyContinue
    shutdown /r /t 0 /f
    return
}

if ($idle -ge $script:warnAtSeconds) {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    $form = New-Object System.Windows.Forms.Form
    $form.FormBorderStyle = 'None'
    $form.WindowState = 'Maximized'
    $form.TopMost = $true
    $form.BackColor = [System.Drawing.Color]::FromArgb(31,45,88)
    $label = New-Object System.Windows.Forms.Label
    $label.AutoSize = $false
    $label.Dock = 'Fill'
    $label.TextAlign = 'MiddleCenter'
    $label.ForeColor = [System.Drawing.Color]::White
    $label.Font = New-Object System.Drawing.Font('Segoe UI', 28, [System.Drawing.FontStyle]::Bold)
    $form.Controls.Add($label)
    $script:formRef = $form
    $script:labelRef = $label

    # A live one-second countdown driven by the real idle timer, held on screen for the whole
    # final 60 seconds. Genuine participant input drops idle below the warning threshold and
    # closes the warning. The form deliberately does NOT close on its own MouseMove event: a
    # maximised window is created under the cursor, so the smallest movement - or the movement
    # the participant makes reaching for the mouse - would dismiss it before it could be read.
    $timer = New-Object System.Windows.Forms.Timer
    $timer.Interval = 1000
    $timer.Add_Tick({
        $now = [Idle]::Seconds()
        if ($now -lt $script:warnAtSeconds -or $now -ge $script:thresholdSeconds) {
            $script:timerRef.Stop(); $script:formRef.Close(); return
        }
        $script:labelRef.Text = "This device will restart in $($script:thresholdSeconds - $now) seconds. Any unsaved work will be deleted. Move the mouse or press a key to continue your session."
    })
    $script:timerRef = $timer
    $label.Text = "This device will restart in $($script:thresholdSeconds - $idle) seconds. Any unsaved work will be deleted. Move the mouse or press a key to continue your session."
    $timer.Start()
    [void]$form.ShowDialog()
    $timer.Stop(); $timer.Dispose(); $form.Dispose()

    # The countdown may have run out while the warning was on screen. Restart now rather than
    # waiting up to another 30 seconds for the next scheduled poll.
    if ([Idle]::Seconds() -ge $script:thresholdSeconds) {
        Remove-Item $armFlag -Force -ErrorAction SilentlyContinue
        shutdown /r /t 0 /f
    }
}
