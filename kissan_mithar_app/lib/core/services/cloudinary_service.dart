import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../config/env_config.dart';
import 'cloudinary_uploader_stub.dart'
    if (dart.library.io) 'cloudinary_uploader_io.dart';

class CloudinaryService {
  CloudinaryService._();

  /// Uploads an image file to Cloudinary and returns the secure URL.
  /// If Cloudinary is not configured or in offline mode, returns the local file path.
  static Future<String> uploadImage(String filePath) async {
    if (!EnvConfig.isCloudinaryConfigured) {
      debugPrint('Cloudinary not configured, returning local path: $filePath');
      return filePath;
    }

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    // Flutter Web handling (avoids dart:io File crash)
    if (kIsWeb) {
      try {
        final cloudName = EnvConfig.cloudinaryCloudName;
        final uri = Uri.parse('https://api.cloudinary.com/v1_1/$cloudName/image/upload');

        final request = http.MultipartRequest('POST', uri)
          ..fields['upload_preset'] = EnvConfig.cloudinaryUploadPreset;

        if (filePath.startsWith('blob:') || filePath.startsWith('data:')) {
          final res = await http.get(Uri.parse(filePath));
          if (res.statusCode == 200) {
            request.files.add(
              http.MultipartFile.fromBytes('file', res.bodyBytes, filename: 'upload.jpg'),
            );
            final response = await request.send();
            final responseBody = await response.stream.bytesToString();
            if (response.statusCode == 200) {
              final data = jsonDecode(responseBody);
              final secureUrl = data['secure_url'] as String?;
              if (secureUrl != null && secureUrl.isNotEmpty) {
                debugPrint('Web Cloudinary Upload Success: $secureUrl');
                return secureUrl;
              }
            }
          }
        }
      } catch (e) {
        debugPrint('Web Cloudinary upload note: $e');
      }
      return filePath;
    }

    // Native Mobile / Desktop handling
    try {
      if (!await checkFileExists(filePath)) {
        return filePath;
      }

      final cloudName = EnvConfig.cloudinaryCloudName;
      final uri = Uri.parse('https://api.cloudinary.com/v1_1/$cloudName/image/upload');

      final request = http.MultipartRequest('POST', uri)
        ..fields['upload_preset'] = EnvConfig.cloudinaryUploadPreset
        ..files.add(await createMultipartFileFromPath('file', filePath));

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();

      if (response.statusCode == 200) {
        final data = jsonDecode(responseBody);
        final secureUrl = data['secure_url'] as String?;
        if (secureUrl != null && secureUrl.isNotEmpty) {
          debugPrint('Cloudinary Upload Success: $secureUrl');
          return secureUrl;
        }
      }
      debugPrint('Cloudinary upload returned status ${response.statusCode}: $responseBody');
      return filePath;
    } catch (e) {
      debugPrint('Cloudinary upload error: $e');
      return filePath;
    }
  }

  /// Uploads an audio recording directly.
  /// First attempts backend direct audio upload (/api/uploads/audio), then Cloudinary auto/upload.
  /// Falls back to returning the audio data or path directly.
  static Future<String> uploadAudio(String audioPath) async {
    if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
      return audioPath;
    }

    // 1. Try backend API audio upload
    try {
      final backendUrl = Uri.parse('${EnvConfig.apiBaseUrl}/uploads/audio');
      final res = await http.post(
        backendUrl,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'audioData': audioPath, 'filename': 'farmer_voice_note.webm'}),
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final url = data['data']?['url'] as String?;
        if (url != null && url.isNotEmpty) {
          debugPrint('Backend Audio Upload Success: $url');
          return url;
        }
      }
    } catch (e) {
      debugPrint('Backend audio upload fallback: $e');
    }

    // 2. Try Cloudinary auto/upload if configured
    if (EnvConfig.isCloudinaryConfigured) {
      try {
        final cloudName = EnvConfig.cloudinaryCloudName;
        final uri = Uri.parse('https://api.cloudinary.com/v1_1/$cloudName/auto/upload');
        final request = http.MultipartRequest('POST', uri)
          ..fields['upload_preset'] = EnvConfig.cloudinaryUploadPreset;

        if (audioPath.startsWith('data:')) {
          request.fields['file'] = audioPath;
          final response = await request.send();
          final body = await response.stream.bytesToString();
          if (response.statusCode == 200) {
            final data = jsonDecode(body);
            final secureUrl = data['secure_url'] as String?;
            if (secureUrl != null && secureUrl.isNotEmpty) {
              return secureUrl;
            }
          }
        }
      } catch (e) {
        debugPrint('Cloudinary audio fallback: $e');
      }
    }

    // 3. Fallback: return audio data/path directly (the DB will store it directly)
    return audioPath;
  }
}

