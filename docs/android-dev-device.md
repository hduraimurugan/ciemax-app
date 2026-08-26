# Running on a physical Android device (local API access)

Checklist for `npm run android` against a physical phone with
`cinema-hall-api` running locally. The emulator "just works" via
`10.0.2.2`; a real device does not, and the symptom is always the same —
the UI renders but every request fails ("Failed to load movies. Please
try again.").

## Why it fails

`API_BASE_URL=http://127.0.0.1:5000` resolves **on the phone**, not on
your PC. The phone has no server on port 5000, so the connection is
refused before it ever leaves the device. Same for `localhost`.

Two ways to fix it. Prefer option A.

## A. `adb reverse` over USB (recommended)

Tunnels the phone's `localhost:5000` back to your PC's `localhost:5000`
over the USB cable — the same mechanism React Native already uses for
the Metro bundler on 8081.

```sh
adb reverse tcp:5000 tcp:5000
```

Verify from the device itself, not from the PC:

```sh
adb shell curl -s -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1:5000/
# -> HTTP 200
```

`adb reverse --list` should show both mappings:

```
UsbFfs tcp:8081 tcp:8081
UsbFfs tcp:5000 tcp:5000
```

**Why this one is preferred:**

- `.env` stays at `http://127.0.0.1:5000`, which is also correct for the
  iOS Simulator — no per-machine edits, nothing to accidentally commit.
- No rebuild. Changing `API_BASE_URL` *does* require one (see
  [Gotchas](#gotchas)); leaving it alone doesn't.
- Bypasses Windows Firewall entirely — traffic never touches the network.
- Works on any Wi-Fi, on mobile data, or on no network at all.

**The catch:** the mapping lives only as long as the USB connection.
Replug the phone, reboot it, or restart the adb server and you must
re-run the command. It does *not* survive going wireless.

## B. LAN IP over Wi-Fi

For when the phone is untethered. Both devices must be on the same
network.

1. Find your PC's LAN IP:

   ```powershell
   Get-NetIPAddress -AddressFamily IPv4 |
     Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
     Select-Object IPAddress, InterfaceAlias
   ```

   Take the one on the `Wi-Fi` interface — ignore Tailscale, WSL, Docker
   and other virtual adapters.

2. Point `.env` at it and **rebuild** (`npm run android`):

   ```
   API_BASE_URL=http://192.168.1.40:5000
   ```

   This IP is DHCP-assigned and will change. Re-check it after a router
   reboot or reconnecting to a different network.

3. Make sure Flask binds all interfaces, not just loopback — `flask run
   --host=0.0.0.0`, or `app.run(host="0.0.0.0", port=5000)`. Confirm:

   ```powershell
   Get-NetTCPConnection -LocalPort 5000 -State Listen |
     Select-Object LocalAddress, LocalPort
   ```

   `0.0.0.0` or `::` is good. `127.0.0.1` means it's loopback-only and no
   firewall rule will help.

4. Open the port in Windows Firewall. **This is the step that bites** —
   without it the phone's packets are dropped silently and the app looks
   identical to the broken state. Run as Administrator:

   ```powershell
   New-NetFirewallRule -DisplayName "Flask dev 5000" -Direction Inbound `
     -Protocol TCP -LocalPort 5000 -Action Allow -Profile Public
   ```

   `-Profile Public` matters: home Wi-Fi is often categorised **Public**
   on Windows, and a rule scoped to `Private` won't apply. Check yours
   with `Get-NetConnectionProfile`. Narrow the rule to `Private` instead
   if you'd rather reclassify the network — but don't reclassify a
   network you don't control.

## Gotchas

**Changing `.env` requires a full rebuild, not a JS reload.**
`react-native-config` reads `.env` at *Gradle build* time and bakes the
values into `BuildConfig` — see the `envConfigFiles` mapping at the top
of [android/app/build.gradle](../android/app/build.gradle#L10). Pressing
`r` in Metro will not pick up a new `API_BASE_URL`; you need
`npm run android` again. (Option A avoids this entirely, since the value
never changes.)

**Cleartext HTTP must stay enabled for dev.** `ENABLE_CLEARTEXT=true` in
`.env` feeds `android:usesCleartextTraffic` via a manifest placeholder
([build.gradle:118](../android/app/build.gradle#L118)). It is `false` in
`.env.production` on purpose — release builds must only ever talk HTTPS.
Don't "fix" a dev connection problem by touching the production file.

**Which `.env` a build reads** is decided by variant, not by you:
`debug -> .env`, `staging -> .env.staging`, `release -> .env.production`.

**`USE_MOCKS=true`** in `.env` bypasses the network entirely
(`src/services/*.mock.ts`). Useful for UI work with no backend, and worth
ruling out before debugging connectivity that isn't actually happening.

**A release build can fail with a `ninja`/CMake "Filename longer than 260
characters" error** if this repo sits deep in your user profile (e.g. under
`Users\<name>\Git Cloned\My Projects\...`). Windows' classic MAX_PATH limit
bites the native C++ codegen build (react-native-safe-area-context and
friends) before it bites anything JS-side — `npm run android` (debug) can
slip under the limit while `assembleRelease` doesn't, since release's CMake
build-type folder name (`RelWithDebInfo`) is longer than debug's (`Debug`)
and pushes some object-file paths over the edge.

Fixed for good in [android/app/build.gradle](../android/app/build.gradle#L94):
native builds stage to a short, fixed path (`C:/rn-cxx-build/MyApp`) instead
of the default `android/app/.cxx`, via AGP's `externalNativeBuild.cmake.buildStagingDirectory`,
guarded to Windows only. No project-relocation or drive-letter tricks needed
— just build normally from wherever the repo lives.

Don't reach for `subst`/junctions to shorten the path instead — it was tried
and reverted. Windows resolves a `subst`'d drive back to its real path via
`fs.realpathSync.native` (which Metro's file-map crawler and
`babel-plugin-module-resolver` both use internally), but *not* via the plain
`fs.realpathSync` that a naive `metro.config.js` fix would reach for first.
The mismatch between "which drive letter Gradle happened to invoke Node
from" and "which path Node's native realpath resolves files to" broke
module resolution in two different, confusing ways (Metro's `"Failed to get
the SHA-1"` error, then a mangled `@alias` import) before the real fix
above made the drive-letter workaround unnecessary. `metro.config.js` still
resolves its project root through `fs.realpathSync.native(__dirname)`
defensively — harmless normally, but it's what would save you if this ever
comes up again in some other form.

## Host cheatsheet

| Target | `API_BASE_URL` |
| --- | --- |
| Physical device, `adb reverse` | `http://127.0.0.1:5000` |
| Physical device, Wi-Fi | `http://<your-LAN-IP>:5000` |
| Android emulator | `http://10.0.2.2:5000` |
| iOS Simulator | `http://localhost:5000` |
| Production | `https://api.yourdomain.com` |

## Optional: automate option A

To stop having to remember the `adb reverse` call, fold it into the
script in `package.json`:

```json
"android": "adb reverse tcp:5000 tcp:5000; react-native run-android"
```

Use `;` rather than `&&` so the build still runs when no device is
attached (an emulator, or a cold boot where adb hasn't seen the device
yet) — `adb reverse` exits non-zero in that case.
