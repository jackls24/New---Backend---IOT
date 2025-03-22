import 'dart:async';
import 'package:geolocator/geolocator.dart';

class LocationService {
  static Future<Position?> getCurrentLocation({int retries = 3}) async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      print("Location service is disabled.");
      return null;
    }

    try {
      /* final result = await Geolocator.getLastKnownPosition(
        forceAndroidLocationManager: true,
      );

      if (result != null) {
        print('Last known location: $result');
        return result;
      }
      */

      final position = await Geolocator.getCurrentPosition().timeout(
        Duration(seconds: 10),
        onTimeout: () {
          throw TimeoutException("Location request timed out.");
        },
      );
      return position;
    } catch (e) {
      print("Error getting location: $e");
      print("Location request failed, retrying... ($retries retries left)");
      await Future.delayed(Duration(seconds: 2));
      if (retries > 0) {
        return getCurrentLocation(retries: retries - 1);
      }
    }

    return null;
  }
}
