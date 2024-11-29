class NetworkException implements Exception {
  NetworkException(this.message, this.statusCode);

  NetworkException.noInternet()
      : message = _noInternetMessage,
        statusCode = _noInternetStatusCode;

  final String message;
  final int statusCode;

  static const _noInternetStatusCode = 0;
  static const _noInternetMessage = 'Please check your internet connection';

  bool get isNoInternet => statusCode == _noInternetStatusCode;

  @override
  String toString() {
    return 'NetworkException: $message (status code: $statusCode)';
  }
}
