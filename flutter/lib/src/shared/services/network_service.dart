import 'dart:convert';
import 'dart:developer';

import 'package:http/http.dart' as http;

import '../exceptions/network_exception.dart';

class NetworkService {
  static const defaultTimeout = Duration(seconds: 20);

  final http.Client client;
  NetworkService(this.client);

  /// Makes a GET request to the given endpoint
  Future<Map<String, dynamic>> get(Uri uri,
      {Map<String, String>? headers}) async {
    log('GET request to $uri');
    try {
      final response =
          await client.get(uri, headers: headers).timeout(defaultTimeout);

      return _getBody(response);
    } catch (e) {
      log('Error in GET request to ${uri.toString()}: $e');
      // check if the error is network exception
      if (e.toString().contains('Failed host lookup')) {
        throw NetworkException.noInternet();
      }
      rethrow;
    }
  }

  /// Makes a POST request to the given endpoint
  Future<Map<String, dynamic>> post(Uri uri,
      {Map<String, String>? headers, String? body}) async {
    try {
      final response = await client
          .post(uri, headers: headers, body: body)
          .timeout(defaultTimeout);

      return _getBody(response);
    } catch (e) {
      log('Error in POST request to ${uri.toString()}: $e');
      // check if the error is network exception
      if (e.toString().contains('Failed host lookup')) {
        throw NetworkException.noInternet();
      }
      rethrow;
    }
  }

  Map<String, dynamic> _getBody(http.Response response) {
    if ((response.statusCode ~/ 100) != 2) {
      throw NetworkException(response.body, response.statusCode);
    }

    if (response.body.isEmpty) return {};

    try {
      final body = jsonDecode(response.body);
      if (body is List || body is String) return {'data': body};

      return body as Map<String, dynamic>;
    } catch (_) {
      // body was not a List or a String or a Map
      return {'data': response.body};
    }
  }
}
