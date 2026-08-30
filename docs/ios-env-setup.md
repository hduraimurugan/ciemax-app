# iOS environment setup (manual — requires Xcode)

This project is developed on Windows, so the iOS side of `react-native-config`
and Google Sign-In cannot be wired up or verified from this environment —
both require editing the `.xcodeproj` / running CocoaPods inside Xcode on a
Mac. `Info.plist` has already been updated with the location and photo
library usage strings (`NSLocationWhenInUseUsageDescription` +
`NSLocationAlwaysAndWhenInUseUsageDescription` since `3c8078f`, and
`NSPhotoLibraryAddUsageDescription`), `CFBundleDisplayName` is set to **Cinemax App**, and
the full `AppIcon.appiconset` is committed (commit `0e9de4b`) — so the app
icon and home-screen label need no manual setup. The remaining steps, to run
once on a Mac:

## 1. react-native-config

1. Open `ios/MyApp.xcworkspace` (after `pod install`).
2. Select the `MyApp` target → **Build Phases** → add a new **Run Script**
   phase **above** "Bundle React Native code and images" containing:
   ```sh
   cp "${SRCROOT}/../.env" "${SRCROOT}/tmp.xcconfig" 2>/dev/null || true
   ```
   (react-native-config's own `react-native-config-ios` build phase does this
   automatically via `pod install` in recent versions — check the Podfile
   output; if `RNCConfig` appears as a pod, no manual script is needed
   beyond `pod install`.)
3. Confirm `Config.debug.xcconfig` / `Config.release.xcconfig` are generated
   under `ios/` per scheme (Debug -> `.env`, Release -> `.env.production`) —
   the RNCConfig pod handles this mapping.
4. `Env.API_BASE_URL` etc. become available in JS via
   `import Config from 'react-native-config'` — no further native code needed.

## 2. Google Sign-In

1. Create an **iOS** OAuth client in Google Cloud Console (Credentials),
   bundle ID matching `PRODUCT_BUNDLE_IDENTIFIER`. Set the resulting client
   ID as `GOOGLE_IOS_CLIENT_ID` in `.env` / `.env.production`.
2. Add the **reversed client ID** as a URL scheme: target → **Info** →
   **URL Types** → add one with the value from
   `REVERSED_CLIENT_ID` in the downloaded `GoogleService-Info.plist` (or
   `com.googleusercontent.apps.<IOS_CLIENT_ID>` if not using Firebase).
3. `pod install` after adding `@react-native-google-signin/google-signin`
   to the Podfile (should autolink already).

## 3. Cleartext / ATS

`NSAllowsArbitraryLoads` is already `false` in `Info.plist` (correct for
production). For local dev against a plain `http://` backend on the iOS
Simulator, `NSAllowsLocalNetworking` (already `true`) covers `localhost`
traffic — no further change needed since dev API calls target
`http://localhost:5000`.

## 4. Camera roll (react-native-camera-roll)

No extra Info.plist entry beyond `NSPhotoLibraryAddUsageDescription`
(already added) — the library only needs *add* permission for saving the
ticket image, not full library read access.
