import 'package:dio/dio.dart';
import 'failures.dart';

class ErrorHandler {
  ErrorHandler._();

  static Failure handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const NetworkFailure('Connection timed out. Please check your signal.');
      case DioExceptionType.connectionError:
        return const NetworkFailure('No internet connection. Please verify mobile data / Wi-Fi.');
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        if (statusCode == 401 || statusCode == 403) {
          return const AuthFailure('Session expired. Please log in again.');
        }
        final message = error.response?.data?['message']?.toString() ??
            'Server returned error ($statusCode)';
        return ServerFailure(message, statusCode);
      case DioExceptionType.cancel:
        return const ServerFailure('Request was cancelled.');
      default:
        return const ServerFailure('An unexpected error occurred. Please try again.');
    }
  }

  static String getFarmerFriendlyMessage(Failure failure) {
    return failure.message;
  }
}
