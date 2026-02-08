# SubTracker Pro India

A comprehensive subscription management app for Indian users with Firebase integration. Track your OTT, streaming, and other subscriptions in one place with support for Indian payment methods and localization.

## Features

- **Subscription management** – Add, edit, and track subscriptions with billing cycles (monthly/yearly) and cost in INR
- **Indian OTT platforms** – Pre-configured support for popular Indian streaming and OTT platforms
- **Firebase backend** – Authentication (phone & social login), Cloud Firestore, Analytics, Crashlytics, and Storage
- **Payments** – Razorpay integration for Indian payment flows
- **Localization** – Multi-language support with `easy_localization`
- **Dashboard & analytics** – Overview and charts via `fl_chart`
- **Notifications** – Local and Firebase Cloud Messaging for renewal reminders
- **Offline-friendly** – Connectivity awareness and local state

## Tech Stack

- **Flutter** (SDK >=3.2.0)
- **Firebase** – Core, Auth, Firestore, Messaging, Analytics, Crashlytics, Storage
- **State management** – Provider, Riverpod
- **UI** – Material Design, Google Fonts, Lottie, Shimmer, SVG
- **Indian-specific** – intl, Razorpay, `flutter_local_notifications`

## Getting Started

### Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (>=3.2.0)
- Firebase project with Android/iOS apps registered
- (Optional) Razorpay account for payments

### Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd hackforge
   flutter pub get
   ```

2. **Firebase**

   - Create a project at [Firebase Console](https://console.firebase.google.com/)
   - Add Android and/or iOS apps and download config files:
     - Android: `android/app/google-services.json`
     - iOS: `ios/Runner/GoogleService-Info.plist`
   - Ensure `lib/firebase_options.dart` is generated (e.g. via FlutterFire CLI: `dart run flutterfire configure`)

3. **Run the app**

   ```bash
   flutter run
   ```

### Asset folders

Ensure these asset directories exist (or create empty ones if needed):

- `assets/images/`
- `assets/logos/`
- `assets/icons/`
- `assets/animations/`
- `assets/translations/`

## Project Structure

```
lib/
├── app/              # App widget, routes
├── core/             # Constants, services, theme, utils
├── features/         # Auth, dashboard, subscriptions (screens, widgets, providers)
├── models/           # User, subscription, notification, family group
├── providers/        # Language, theme
├── firebase_options.dart
└── main.dart
```

## Resources

- [Flutter documentation](https://docs.flutter.dev/)
- [Firebase for Flutter](https://firebase.google.com/docs/flutter/setup)
- [Razorpay Flutter](https://razorpay.com/docs/payments/payment-gateway/flutter-integration/)

## License

This project is not published to pub.dev (`publish_to: 'none'`).
