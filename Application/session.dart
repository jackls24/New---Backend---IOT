import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class Session {
  static final _storage = FlutterSecureStorage();

  static Future<void> saveUserSession(Map<String, dynamic> sessionData) async {
    await _storage.write(key: 'sessionData', value: jsonEncode(sessionData));
  }

  static Future<Map<String, dynamic>?> getUserSession() async {
    final value = await _storage.read(key: 'sessionData');
    if (value != null) {
      return jsonDecode(value);
    }
    return null;
  }

  static Future<void> clearUserSession() async {
    await _storage.delete(key: 'sessionData');
  }
}