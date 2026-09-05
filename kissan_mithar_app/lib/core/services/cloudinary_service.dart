import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../config/env_config.dart';

class CloudinaryService {
  CloudinaryService._();

  /// Uploads an image file to Cloudinary and returns the secure URL.
  /// If Cloudinary is not configured or in offline mode, returns the local file path.
  static Future<String> uploadImage(String filePath) async {
    if (!EnvConfig.isCloudinaryConfigured) {
      debugPrint('Cloudinary not configured, returning local path: $filePath');
      return filePath;
    }

    final file = File(filePath);
    if (!file.existsSync()) {
      return filePath;
    }

    try {
      final cloudName = EnvConfig.cloudinaryCloudName;
      final uri = Uri.parse('https://api.cloudinary.com/v1_1/$cloudName/image/upload');

      final request = http.MultipartRequest('POST', uri)
        ..fields['upload_preset'] = EnvConfig.cloudinaryUploadPreset
        ..files.add(await http.MultipartFile.fromPath('file', filePath));

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
}
