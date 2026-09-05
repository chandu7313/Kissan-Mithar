class ServerException implements Exception {
  final String message;
  final int? statusCode;

  const ServerException([this.message = 'Server Exception', this.statusCode]);

  @override
  String toString() => 'ServerException: $message (code: $statusCode)';
}

class NetworkException implements Exception {
  final String message;

  const NetworkException([this.message = 'Network Connection Exception']);

  @override
  String toString() => 'NetworkException: $message';
}

class AuthException implements Exception {
  final String message;

  const AuthException([this.message = 'Authentication Exception']);

  @override
  String toString() => 'AuthException: $message';
}
