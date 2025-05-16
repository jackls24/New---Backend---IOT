import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:permission_handler/permission_handler.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Bluetooth Scanner',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const BluetoothPage(),
    );
  }
}

class BluetoothPage extends StatefulWidget {
  const BluetoothPage({super.key});

  @override
  _BluetoothPageState createState() => _BluetoothPageState();
}

class _BluetoothPageState extends State<BluetoothPage> {
  List<BluetoothDevice> _devices = [];
  bool _isScanning = false;
  late StreamSubscription<List<ScanResult>> _scanSubscription;

  @override
  void initState() {
    super.initState();
    _requestPermissions();
    //_checkBluetoothState();
  }

 Future<void> _requestPermissions() async {
  // Richiede i permessi necessari
  Map<Permission, PermissionStatus> statuses = await [
    Permission.location,
    Permission.bluetooth,
    Permission.bluetoothConnect,
    Permission.bluetoothScan,
  ].request();

  // Verifica lo stato dei permessi
  if (statuses[Permission.location]!.isGranted &&
      statuses[Permission.bluetooth]!.isGranted &&
      statuses[Permission.bluetoothConnect]!.isGranted &&
      statuses[Permission.bluetoothScan]!.isGranted) {
    print("All permissions granted");
  } else {
    print("Some permissions denied");
  }
}

  void _startScan() {
    setState(() {
      _isScanning = true;
      _devices = [];
    });

    _scanSubscription = FlutterBluePlus.scanResults.listen(
      (results) {
        print("Scan results: ${results.length} devices found");
        for (ScanResult result in results) {
          print("Device: ${result.device.platformName}, ID: ${result.device.remoteId}, RSSI: ${result.rssi}");
        }
        for (ScanResult result in results) {
          if (!_devices.contains(result.device)) {
            setState(() {
              _devices.add(result.device);
            });
          }
        }
      },
      onError: (error) {
        print("Scan error: $error");
      },
    );

    FlutterBluePlus.startScan(timeout: const Duration(seconds: 10));
  }

  void _stopScan() {
    FlutterBluePlus.stopScan();
    _scanSubscription.cancel();
    setState(() {
      _isScanning = false;
    });
  }

  @override
  void dispose() {
    _stopScan();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bluetooth Scanner')),
      body: Column(
        children: [
          ElevatedButton(
            onPressed: _isScanning ? _stopScan : _startScan,
            child: Text(_isScanning ? 'Stop Scan' : 'Start Scan'),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _devices.length,
              itemBuilder: (context, index) {
                BluetoothDevice device = _devices[index];
                return ListTile(
                  title: Text(device.platformName ?? 'Unknown Device'),
                  subtitle: Text(
                    'ID: ${device.remoteId}\n'
                    'RSSI: $device dBm',
                  ),
                  trailing: Icon(Icons.bluetooth),
                  onTap: () {
                    // Puoi aggiungere qui la logica per la connessione
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}