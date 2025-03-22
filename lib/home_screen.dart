import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'location_service.dart';
import 'package:location/location.dart';
import 'package:geolocator/geolocator.dart';
import 'bluetooth_services.dart';
import 'models/boat_info.dart';
import 'auth_service.dart';
import 'dart:async';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  GoogleMapController? _controller;
  Position? _currentLocation;
  BoatInfo? _boatInfo;
  bool _isConnected = false;
  String username = "";
  Timer? _positionTimer;

  @override
  void initState() {
    super.initState();
    print("InitState HomeScreen");

    _checkAuthentication();
    _initListeners();

    _positionTimer = Timer.periodic(const Duration(seconds: 10), (timer) {
      _updatePosition();
    });

    _updateLocation();
  }

  // Verifica autenticazione e aggiorna username
  void _checkAuthentication() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (CognitoManager.currentUser == null) {
        Navigator.pushReplacementNamed(context, '/');
      } else {
        setState(() {
          username = CognitoManager.currentUser?.givenName ?? "Utente";
        });
      }
    });
  }

  void _initListeners() {
    BluetoothServices.isConnectedNotifier.addListener(_onDeviceConnected);
    BluetoothServices.isConnectedNotifier.addListener(_onDeviceDisconnected);
  }

  // Aggiorna la posizione corrente
  Future<void> _updateLocation() async {
    final locationData = await _getCurrentLocation();
    setState(() {
      _currentLocation = locationData;
    });
  }

  // Ritorna la posizione attuale
  Future<Position?> _getCurrentLocation() async {
    return await LocationService.getCurrentLocation();
  }

  // Invia la posizione corrente
  Future<void> _updatePosition() async {
    print("_updatePosition");
    final localPosition = await _getCurrentLocation();
    print("localPosition: $localPosition");

    if (localPosition != null) {
      BluetoothServices.sendSetPosition(
        localPosition.latitude!,
        localPosition.longitude!,
      );
    }
  }

  Future<void> _getBoatInfo() async {
    if (!BluetoothServices.isConnected) return;
    final boatInfo = await BluetoothServices.requestInfo();
    if (mounted) {
      setState(() {
        _boatInfo = boatInfo;
      });
    }
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

  void _logout() {
    CognitoManager.currentUser = null;
    Navigator.pushReplacementNamed(context, '/');
  }

  @override
  void dispose() {
    _positionTimer?.cancel();
    BluetoothServices.isConnectedNotifier.removeListener(_onDeviceConnected);
    BluetoothServices.isConnectedNotifier.removeListener(_onDeviceDisconnected);
    super.dispose();
  }

  Widget _buildStatusIndicator(String label, bool connected) {
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

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        children: [
          Row(
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
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Benvenuto, $username',
                style: const TextStyle(color: Colors.white70, fontSize: 18),
              ),
              TextButton.icon(
                onPressed: _logout,
                icon: const Icon(Icons.logout, color: Colors.white70),
                label: const Text(
                  'Logout',
                  style: TextStyle(color: Colors.white70),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMapCard() {
    return Padding(
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
    );
  }

  Widget _buildBoatInfoCard() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.0),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
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
    );
  }

  Widget _buildBody() {
    return _currentLocation == null
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
          child: Column(
            children: [
              _buildMapCard(),
              if (BluetoothServices.isConnected && _boatInfo != null)
                _buildBoatInfoCard(),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildStatusIndicator('Stato Barca', _isConnected),
                    const SizedBox(width: 24),
                    _buildStatusIndicator('Connesso', _isConnected),
                  ],
                ),
              ),
            ],
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
            children: [_buildHeader(), Expanded(child: _buildBody())],
          ),
        ),
      ),
    );
  }
}
