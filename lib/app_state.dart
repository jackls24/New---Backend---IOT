import 'package:flutter/material.dart';

class AppState extends ChangeNotifier {
  bool _status = false;

  bool get status => _status;

  void updateStatus(bool newStatus) {
    _status = newStatus;
    notifyListeners();
  }
}