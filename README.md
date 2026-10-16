# MotoOilApp

Simple cellphone app to track motorcycle oil changes. Data is stored locally with
AsyncStorage; there is no backend.

Maintenance rules (defaults):

- Oil change every **2500 km**.
- Oil filter every **2 oil changes** (every 5000 km).
- Air filter every **7500 km** (every 3 oil changes).

## Screens

1. **Dashboard** — current km, km since last change, km remaining, next change km,
   plus YES/NO badges for oil filter due and air filter due on the next change.
   Status is OK, URGENT (remaining <= 300 km) or DUE (remaining <= 0).
2. **Register** — date is automatic (today); enter km, optional oil brand/type,
   and check whether the oil filter and/or air filter were changed.
3. **History** — list of entries (date, km, filters) with a delete-last-entry button.
4. **Settings** — edit the intervals and the current odometer.

## Where intervals are configured

- In the app: **Settings** screen (persisted with AsyncStorage).
- In code: `src/lib/oilLogic.ts` (`DEFAULT_SETTINGS`) and `src/lib/storage.ts`
  (storage keys `@motooil/entries` and `@motooil/settings`).
- The filter counters (2 and 3 changes) are derived from the km intervals:
  `round(oilFilterKm / oilInterval)` and `round(airFilterKm / oilInterval)`.

## Run in Expo Go (quick test)

Requirements: Node 22 + npm 10, and the Expo Go app from the Play Store.

This project is pinned to **Expo SDK 57** (`expo ~57.0.0`, React 19.2.3,
React Native 0.86.3), which the current Play Store Expo Go supports, so no
sideload or dev build is needed. Just make sure Expo Go itself is updated to
the latest version from the Play Store before scanning.

```bash
cd MotoOilApp
npm install
npx expo start
```

Then scan the QR code with the Expo Go app on your phone
(same Wi-Fi network as the computer).

## Get an APK via EAS cloud build

No local Android build is needed. On this machine there is no Java, no Gradle,
and no `ANDROID_HOME`, so use the Expo cloud builder:

```bash
npm install -g eas-cli
eas login
eas init        # links the project and fills in extra.eas.projectId
eas build -p android --profile preview
```

The `preview` profile in `eas.json` produces an **APK**
(`android.buildType: apk`) ready to install on a phone.
When the build finishes, EAS gives a download link / QR code.

## Project structure

- `App.tsx` — tab navigation and state (entries + settings).
- `src/lib/oilLogic.ts` — maintenance math (next km, remaining, filter due badges).
- `src/lib/storage.ts` — AsyncStorage persistence plus the seed entry.
- `src/screens/` — Dashboard, Register, History, Settings screens.
- `app.json` — Expo config, Android package `com.sebas.motooilapp`.
- `eas.json` — EAS profiles; `preview` builds an APK in the cloud.
