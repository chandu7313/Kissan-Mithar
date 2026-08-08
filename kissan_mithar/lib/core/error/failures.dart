abstract class Failure {
  final String message;
  final int? statusCode;

  const Failure(this.message, [this.statusCode]);

  @override
  String toString() => 'Failure(message: $message, statusCode: $statusCode)';
}

class ServerFailure extends Failure {
  const ServerFailure([super.message = 'Server error occurred', super.statusCode]);
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'No internet connection. Please check your network.']);
}

class AuthFailure extends Failure {
  const AuthFailure([super.message = 'Authentication failed. Please login again.']);
}

class ValidationFailure extends Failure {
  const ValidationFailure([super.message = 'Invalid input provided.']);
}
