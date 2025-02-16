import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:provider/provider.dart';
import 'app_state.dart'; // Add this line to import AppState

class BluetoothSettingsScreen extends StatefulWidget {
  const BluetoothSettingsScreen({super.key});

  @override
  _BluetoothSettingsScreenState createState() =>
      _BluetoothSettingsScreenState();
}

class _BluetoothSettingsScreenState extends State<BluetoothSettingsScreen> {
  bool _isScanning = false;
  bool _isBluetoothOn = false;
  List<ScanResult> _scanResults = [];
  BluetoothDevice? _connectedDevice;

  @override
  void initState() {
    super.initState();
    _getBluetoothStatus();
  }

  Future<bool> _getBluetoothStatus() async {
    bool isOn = await FlutterBluePlus.isOn;
    setState(() {
      _isBluetoothOn = isOn;
    });
    return isOn;
  }

  Future<void> _turnOnBluetooth() async {
    bool isOn = await _getBluetoothStatus();
    try {
      if (!isOn) {
        await FlutterBluePlus.turnOn();
        setState(() {
          _isBluetoothOn = true;
        });
      }
    } catch (e) {
      setState(() {
        _isBluetoothOn = false;
        _scanResults = [];
      });
      print("Errore durante l'attivazione del Bluetooth: $e");
    }
  }

  void _startScan() {
    // Provider.of<AppState>(context, listen: false).updateStatus(true);

    _turnOnBluetooth();

    setState(() {
      _isScanning = true;
      _scanResults = [];
    });

    FlutterBluePlus.scanResults.listen((results) {
      setState(() {
        _scanResults = results;
      });
    });

    FlutterBluePlus.startScan(timeout: const Duration(seconds: 10))
        .then((_) {
          setState(() {
            _isScanning = true;
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
    FlutterBluePlus.stopScan()
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

  Future<void> _connectToDevice(BluetoothDevice device) async {
    try {
      await device.connect();
      setState(() {
        _connectedDevice = device;
      });
    } catch (e) {
      print("Errore di connessione: $e");
    }
  }

  Future<void> _disconnectDevice() async {
    if (_connectedDevice != null) {
      await _connectedDevice!.disconnect();
      setState(() {
        _connectedDevice = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bluetooth Scanner')),
      body: Stack(
        children: [
          Column(
            children: [
              if (!_isBluetoothOn)
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
              Container(
                height: 600, // Altezza limitata della lista dispositivi
                //color: const Color.fromARGB(255, 213, 140, 140),
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
