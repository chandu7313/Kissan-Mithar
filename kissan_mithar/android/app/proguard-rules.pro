# Flutter Wrapper ProGuard Rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Google Play Core (Flutter deferred components) — not used in standard APK builds
-dontwarn com.google.android.play.core.**

# Google Maps ProGuard Rules
-keep class com.google.android.gms.maps.** { *; }
-keep interface com.google.android.gms.maps.** { *; }

# Local Notifications ProGuard Rules
-keep class com.dexterous.flutterlocalnotifications.** { *; }

# Supabase & JSON Serialization Rules
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-dontwarn javax.annotation.**
-dontwarn org.checkerframework.**

