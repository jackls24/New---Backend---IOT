import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'bluetooth_services.dart';

class BluetoothSettingsScreen extends StatefulWidget {
  const BluetoothSettingsScreen({super.key});

  @override
  _BluetoothSettingsScreenState createState() =>
      _BluetoothSettingsScreenState();
}

class _BluetoothSettingsScreenState extends State<BluetoothSettingsScreen> {
  final BluetoothServices _bluetoothService = BluetoothServices();

  bool _isScanning = false;
  bool _isConnected = false;
  BluetoothDevice? _connectedDevice;
  List<ScanResult> _scanResults = [];

  @override
  void initState() {
    super.initState();
    _bluetoothService.getBluetoothStatus();
  }

  void _startScan() {
    setState(() {
      _isScanning = true;
      _scanResults = [];
    });

    _bluetoothService
        .startScan((results) {
          setState(() {
            _scanResults = results;
          });
        })
        .catchError((error) {
          setState(() {
            _isScanning = false;
          });
          print("Errore durante la scansione: $error");
        });
  }

  void _stopScan() {
    _bluetoothService
        .stopScan()
        .then((_) {
          setState(() {
            _isScanning = false;
          });
        })
        .catchError((error) {
          setState(() {
            _isScanning = false;
          });
          print("Errore durante l'arresto della scansione: $error");
        });
  }

   void _connectToDevice(BluetoothDevice device) {
    _bluetoothService.connectToDevice(device).then((isConnected) {
      setState(() {
        if (isConnected) {
          _connectedDevice = device;
        } else {
          _connectedDevice = null;
        }
      });
    });
  }

  void _disconnectDevice() {
    _bluetoothService.disconnectDevice().then((_) {
      setState(() {
        _connectedDevice = null;
      });
    });
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bluetooth Scanner')),
      body: Stack(
        children: [
          Column(
            children: [
              if (!_bluetoothService.isBluetoothOn)
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    'Bluetooth is off. Please enable it.',
                    style: TextStyle(
                      color: Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.only(top: 40),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Text('Dispositivi trovati: ${_scanResults.length}'),
                  ),
                ),
              ),
              SizedBox(
                height: 600, // Altezza limitata della lista dispositivi
                child: ListView.builder(
                  itemCount: _scanResults.length,
                  itemBuilder: (context, index) {
                    ScanResult result = _scanResults[index];
                    BluetoothDevice device = result.device;
                    String deviceName =
                        result.advertisementData.localName.isNotEmpty
                            ? result.advertisementData.localName
                            : device.platformName ?? '';

                    if (deviceName.isEmpty) {
                      return Container(); // Non visualizzare il dispositivo senza nome
                    }

                  bool isConnected = _connectedDevice == device;
                  print("isConnected: $_connectedDevice");

                    return ListTile(
                      title: Text(deviceName),
                      subtitle: Text('ID: ${device.remoteId}'),
                      trailing: ElevatedButton(
                        onPressed:
                            isConnected
                                ? _disconnectDevice
                                : () => _connectToDevice(device),
                        child: Text(isConnected ? 'Disconnect' : 'Connect'),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
          Positioned(
            bottom: 16,
            right: 16,
            child: FloatingActionButton(
              onPressed: _isScanning ? _stopScan : _startScan,
              child:
                  _isScanning
                      ? const CircularProgressIndicator(
                        color: Color.fromARGB(255, 224, 229, 255),
                      )
                      : const Icon(Icons.refresh),
            ),
          ),
        ],
      ),
    );
  }
}
