# Flutter-specific ProGuard rules

# Keep Flutter engine classes
-keep class io.flutter.** { *; }
-dontwarn io.flutter.embedding.**

# Keep Google Maps
-keep class com.google.android.gms.maps.** { *; }
-keep interface com.google.android.gms.maps.** { *; }

# Keep Gson (used by some plugins)
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }

# Keep video_player
-keep class io.flutter.plugins.videoplayer.** { *; }

# Keep image_picker
-keep class io.flutter.plugins.imagepicker.** { *; }

# Keep geolocator
-keep class com.baseflow.geolocator.** { *; }

# Prevent stripping of annotations used by Firebase
-keepattributes RuntimeVisibleAnnotations
