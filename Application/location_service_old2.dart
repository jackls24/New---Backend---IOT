import 'package:location/location.dart';
import 'package:flutter/services.dart';

class LocationService {
  static final Location _location = Location();

  // Richiede il servizio e i permessi di localizzazione
  static Future<bool> _ensureLocationEnabledAndPermitted() async {
    if (!await _location.serviceEnabled()) {
      bool serviceEnabled = await _location.requestService();
      if (!serviceEnabled) return false;
    }

    PermissionStatus permission = await _location.hasPermission();
    if (permission == PermissionStatus.denied ||
        permission == PermissionStatus.deniedForever) {
      permission = await _location.requestPermission();
      if (permission != PermissionStatus.granted) return false;
    }

    return true;
  }

  // Ritorna la posizione attuale se i permessi sono stati concessi
  static Future<LocationData?> getCurrentLocation() async {
    try {
      bool permitted = await _ensureLocationEnabledAndPermitted();

      if (!permitted) {
        print("LocationService - No Permission granted");
        return null;
      }

      _location
          .enableBackgroundMode(enable: true)
          .then((value) => print("Background mode enabled: $value"));

      final locationData = await _location.getLocation();
      print("Location Data: $locationData");
      return locationData;
    } catch (e) {
      print("Errore durante l'ottenimento della posizione: $e");
      return null;
    }
  }
}
