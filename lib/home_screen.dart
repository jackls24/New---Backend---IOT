import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'location_service.dart';
import 'package:location/location.dart';
import 'bluetooth_services.dart';
import 'models/boat_info.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  GoogleMapController? _controller;
  LocationData? _currentLocation;
  final LocationService _locationService = LocationService();
  BoatInfo? _boatInfo;
  bool _isConnected = false;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
    BluetoothServices.isConnectedNotifier.addListener(_onDeviceConnected);
    BluetoothServices.isConnectedNotifier.addListener(_onDeviceDisconnected);
  }

  @override
  void dispose() {
    BluetoothServices.isConnectedNotifier.removeListener(_onDeviceConnected);
    BluetoothServices.isConnectedNotifier.removeListener(_onDeviceDisconnected);
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    final locationData = await _locationService.getCurrentLocation();
    setState(() {
      _currentLocation = locationData;
    });
  }

  Future<void> _getBoatInfo() async {
    if (!BluetoothServices.isConnected) {
      return;
    }
    final boatInfo = await BluetoothServices.requestInfo();
    setState(() {
      _boatInfo = boatInfo;
    });
  }

  void _onDeviceConnected() {
    setState(() {
      _isConnected = BluetoothServices.isConnectedNotifier.value;
    });
  }

  void _onDeviceDisconnected() {
    if (!BluetoothServices.isConnectedNotifier.value) {
      setState(() {
        _isConnected = false;
        _boatInfo = null;
      });
    }
  }

  // Widget per visualizzare lo stato (connesso/non connesso)
  Widget statusIndicator(String label, bool connected) {
    return Row(
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(width: 8),
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            color: connected ? Colors.green : Colors.red,
            shape: BoxShape.circle,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Background a gradiente accattivante
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xff0D47A1), Color(0xff1976D2), Color(0xff42A5F5)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header custom con icona e titolo
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.directions_boat, color: Colors.white, size: 28),
                    SizedBox(width: 8),
                    Text(
                      'Home',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  ],
                ),
              ),
              Expanded(
                child: _currentLocation == null
                    ? const Center(child: CircularProgressIndicator())
                    : SingleChildScrollView(
                        child: Column(
                          children: [
                            // Card per Google Maps con bordo arrotondato
                            Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Card(
                                elevation: 6,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16.0),
                                ),
                                child: SizedBox(
                                  height: 300,
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(16.0),
                                    child: GoogleMap(
                                      initialCameraPosition: CameraPosition(
                                        target: LatLng(
                                          _currentLocation!.latitude!,
                                          _currentLocation!.longitude!,
                                        ),
                                        zoom: 15,
                                      ),
                                      onMapCreated: (controller) {
                                        _controller = controller;
                                      },
                                      myLocationEnabled: true,
                                      myLocationButtonEnabled: true,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            // Card per le informazioni della barca (se connesso)
                            if (BluetoothServices.isConnected &&
                                _boatInfo != null)
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16.0, vertical: 8.0),
                                child: Card(
                                  elevation: 4,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16.0),
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Targa: ${_boatInfo!.targa}',
                                          style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          'Nome Dispositivo: ${_boatInfo!.dispName}',
                                          style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            // Indicatori di stato
                            Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  statusIndicator('Stato Barca', _isConnected),
                                  const SizedBox(width: 24),
                                  statusIndicator('Connesso', _isConnected),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
