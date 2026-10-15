import 'dart:io';
import 'package:http/http.dart' as http;

Future<bool> checkFileExists(String filePath) async {
  return File(filePath).existsSync();
}

Future<http.MultipartFile> createMultipartFileFromPath(String field, String filePath) {
  return http.MultipartFile.fromPath(field, filePath);
}
