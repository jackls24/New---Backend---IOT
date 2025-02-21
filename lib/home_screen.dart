import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'location_service.dart';
import 'package:location/location.dart';
import 'bluetooth_services.dart'; // Importa BluetoothServices
import 'models/boat_info.dart'; // Importa BoatInfo

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Center(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Text('Home'),
              SizedBox(width: 8),
              Icon(Icons.directions_boat),
            ],
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Stack(
          children: [
            _currentLocation == null
                ? const Center(child: CircularProgressIndicator())
                : Column(
                  children: [
                    const SizedBox(height: 300),
                    const Text(
                      'La tua posizione',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.blueAccent),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.5),
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
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
                    if (BluetoothServices.isConnected && _boatInfo != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Targa: ${_boatInfo!.targa}',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              'Nome Dispositivo: ${_boatInfo!.dispName}',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
            Positioned(
              top: 10,
              right: 10,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'Stato Barca:',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 5),
                        Container(
                          width: 20,
                          height: 20,
                          decoration: BoxDecoration(
                            color: _isConnected ? Colors.green : Colors.red,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'Connesso:',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 5),
                        Container(
                          width: 20,
                          height: 20,
                          decoration: BoxDecoration(
                            color: _isConnected ? Colors.green : Colors.red,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
