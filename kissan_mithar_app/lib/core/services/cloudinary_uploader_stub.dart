import 'package:http/http.dart' as http;

Future<bool> checkFileExists(String filePath) async => false;

Future<http.MultipartFile> createMultipartFileFromPath(String field, String filePath) async {
  throw UnsupportedError('MultipartFile.fromPath is not supported on web');
}
