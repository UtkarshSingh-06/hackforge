# SubTracker Pro India (Flutter)

Subscription management for Indian users: Firebase auth, Firestore subscriptions, INR formatting, Hindi/English UI.

## Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (see `pubspec.yaml` for minimum version)
- [Android Studio](https://developer.android.com/studio) or Android SDK + an emulator or USB device
- A [Firebase](https://console.firebase.google.com/) project with Android (and optionally iOS) app registered

## Setup

1. Open a terminal in **this folder** (`app/hackforge`).

2. Install packages:

   ```bash
   flutter pub get
   ```

3. Firebase (required for auth and data):

   - Download `google-services.json` from Firebase Console → Project settings → Your Android app → place it at `android/app/google-services.json`.
   - Generate `lib/firebase_options.dart` (e.g. [FlutterFire CLI](https://firebase.flutter.dev/docs/cli/): `dart pub global activate flutterfire_cli` then `flutterfire configure` from this directory).

4. Optional: create empty asset dirs if missing: `assets/images/`, `assets/logos/`, `assets/icons/`, `assets/animations/`, `assets/translations/` (placeholders may already exist).

## Run

```bash
flutter devices          # list phones/emulators
flutter run              # pick a device, or:
flutter run -d android   # Android emulator/device
```

Open the project in **VS Code / Android Studio** and use the Run/Debug action on `lib/main.dart` for the same result.

## Tests

```bash
flutter test
```
