import 'package:location/location.dart';

class LocationService {
  final Location _location = Location();

  Future<bool?> getPermission() async {
    try {
      bool serviceEnabled;
      PermissionStatus permissionGranted;

      serviceEnabled = await _location.serviceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await _location.requestService();
        if (!serviceEnabled) {
          //ScaffoldMessenger.of(context).showSnackBar(
          // SnackBar(content: Text('Permesso di localizzazione non concesso')),
          //);

          return false;
        }
      }

      // Controlla se l'app ha il permesso di accedere alla posizione
      permissionGranted = await _location.hasPermission();

      if (permissionGranted == PermissionStatus.denied ||
          permissionGranted == PermissionStatus.deniedForever) {
        permissionGranted = await _location.requestPermission();

        if (permissionGranted != PermissionStatus.granted) {
          return false;
        }
      }
      return true;
    } catch (e) {
      print('Errore durante l\'ottenimento della posizione: $e');
      return false;
    }
  }

  Future<LocationData?> getCurrentLocation() async {
    try {
      bool? permission = await getPermission();

      if (permission == false) {
        return null;
      }

      return await _location.getLocation();
    } catch (e) {
      print("Errore durante l'ottenimento della posizione: $e");

      return null;
    }
  }
}
