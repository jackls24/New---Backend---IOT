import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'bluetooth_services.dart';
import 'configuration_form.dart'; // Importa ConfigurationForm
import 'constant.dart';
import 'models/boat_info.dart'; // Importa BoatInfo
import 'dart:async'; // Importa Timer
import 'advertising_services.dart'; // Importa AdvertisingServices

class BluetoothSettingsScreen extends StatefulWidget {
  const BluetoothSettingsScreen({super.key});

  @override
  _BluetoothSettingsScreenState createState() =>
      _BluetoothSettingsScreenState();
}

class _BluetoothSettingsScreenState extends State<BluetoothSettingsScreen> {
  bool _isScanning = false;
  bool _isConnected = false;
  BluetoothDevice? _connectedDevice;
  List<ScanResult> _scanResults = [];
  BoatInfo? _boatInfo;
  Timer? _autoConnectTimer;

  @override
  void initState() {
    super.initState();
    BluetoothServices.getBluetoothStatus();
    print("Service ID: ${AdvertisingServices.serviceID}"); // Utilizza serviceID
  }

  @override
  void dispose() {
    super.dispose();
  }

  void _stopAutoConnectTimer() {
    _autoConnectTimer?.cancel();
  }

  void _startScan() {
    setState(() {
      _isScanning = true;
      _scanResults = [];
    });

    BluetoothServices.startScan((results) {
      setState(() {
        _scanResults = results;
      });
    }).catchError((error) {
      setState(() {
        _isScanning = false;
      });
      print("Errore durante la scansione: $error");
    });
  }

  void _stopScan() {
    BluetoothServices.stopScan()
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

  void getInfo() {
    BluetoothServices.requestInfo().then((boatInfo) {
      // Se riceviamo boatInfo allora navighiamo al form di configurazione
      Navigator.push(
        context,
        MaterialPageRoute(
          builder:
              (context) => ConfigurationForm(
                deviceMac: _connectedDevice?.remoteId.toString() ?? '',
              ),
        ),
      );
    });
  }

  void _connectToDevice(BluetoothDevice device) {
    BluetoothServices.connectToDevice(device)
        .then((isConnected) {
          if (isConnected) {
            BluetoothServices.subscribeToCharacteristic();
            getInfo();
          }
          setState(() {
            _connectedDevice = isConnected ? device : null;
          });
        })
        .catchError((error) {
          setState(() {
            _connectedDevice = null;
            _scanResults = [];
            _isConnected = false;
          });
          _stopScan();
          _startScan();
          showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                title: const Text('Errore di connessione'),
                content: Text(
                  'Si è verificato un errore durante la connessione: $error',
                ),
                actions: <Widget>[
                  TextButton(
                    child: const Text('OK'),
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                  ),
                ],
              );
            },
          );
        });
  }

  void _disconnectDevice() {
    BluetoothServices.disconnectDevice().then((_) {
      setState(() {
        _connectedDevice = null;
      });
    });
  }

  // Creazione di una Card personalizzata per visualizzare il dispositivo
  Widget _buildDeviceCard(ScanResult result) {
    final BluetoothDevice device = result.device;
    String deviceName =
        result.advertisementData.localName.isNotEmpty
            ? result.advertisementData.localName
            : device.platformName ?? 'Dispositivo sconosciuto';

    // Se il dispositivo non ha un nome, non lo visualizziamo
    if (deviceName.isEmpty) return const SizedBox();

    bool isConnected = _connectedDevice == device;

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.0)),
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: ListTile(
        onTap:
            isConnected
                ? () {
                  getInfo();
                }
                : null,
        leading: Icon(
          Icons.bluetooth,
          color: isConnected ? Colors.green : Colors.blueAccent,
          size: 32,
        ),
        title: Text(
          deviceName,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text('ID: ${device.remoteId}'),
        trailing: ElevatedButton(
          style: ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24.0),
            ),
          ),
          onPressed:
              isConnected ? _disconnectDevice : () => _connectToDevice(device),
          child: Text(isConnected ? 'Disconnetti' : 'Connetti'),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Utilizzo di un appbar trasparente per integrare il background
      appBar: AppBar(
        title: const Text('Bluetooth Scanner'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xff0D47A1), Color(0xff1976D2), Color(0xff42A5F5)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Stack(
          children: [
            Column(
              children: [
                if (!BluetoothServices.isBluetoothOn)
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      'Il Bluetooth è disabilitato. Abilitalo per procedere.',
                      style: TextStyle(
                        color: Colors.red[200],
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                Padding(
                  padding: const EdgeInsets.only(top: 100, left: 16, right: 16),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Dispositivi trovati: ${_scanResults.length}',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 18,
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.only(top: 16),
                    itemCount: _scanResults.length,
                    itemBuilder: (context, index) {
                      return _buildDeviceCard(_scanResults[index]);
                    },
                  ),
                ),
              ],
            ),
            Positioned(
              bottom: 16,
              right: 16,
              child: FloatingActionButton(
                backgroundColor: Colors.white70,
                onPressed: _isScanning ? _stopScan : _startScan,
                child:
                    _isScanning
                        ? const CircularProgressIndicator(color: Colors.blue)
                        : const Icon(Icons.refresh, color: Colors.blue),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
