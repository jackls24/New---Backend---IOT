import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'bluetooth_services.dart';
import 'configuration_form.dart'; // Importa ConfigurationForm
import 'constant.dart';
import 'models/boat_info.dart'; // Importa BoatInfo
import 'dart:async'; // Importa Timer

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
    _startAutoConnectTimer();
  }

  @override
  void dispose() {
    _stopAutoConnectTimer();
    super.dispose();
  }

  void _startAutoConnectTimer() {
    _autoConnectTimer?.cancel();
    _autoConnectTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      print("----------autoConnectToSavedDevice-----------");
     //BluetoothServices.autoConnectToSavedDevice();
    });
  }

  void _stopAutoConnectTimer() {
    _autoConnectTimer?.cancel();
  }

  void _startScan() {
    setState(() {
      _isScanning = true;
      _scanResults = [];
    });

    BluetoothServices
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
    BluetoothServices
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

  void getInfo() {
    BluetoothServices.requestInfo().then((boatInfo) {

      if (boatInfo == null || boatInfo != null ) { //per debug da cambiare
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ConfigurationForm(
              deviceMac: _connectedDevice?.remoteId.toString() ?? '',
            ),
          ),
        );
      } else {
        setState(() {
          _boatInfo = boatInfo;
        });
        print("Informazioni ricevute: ${boatInfo.toString()}");
        // Visualizza l'oggetto ricevuto come desiderato
      }
    });
  }

  void _connectToDevice(BluetoothDevice device) {
    BluetoothServices.connectToDevice(device).then((isConnected) {
      if (isConnected) {
        BluetoothServices.subscribeToCharacteristic();
        getInfo();
      }
      setState(() {
        _connectedDevice = isConnected ? device : null;
      });
    }).catchError((error) {
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
            title: Text('Errore di connessione'),
            content: Text('Si è verificato un errore durante la connessione: $error'),
            actions: <Widget>[
              TextButton(
                child: Text('OK'),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bluetooth Scanner')),
      body: Stack(
        children: [
          Column(
            children: [
              if (!BluetoothServices.isBluetoothOn)
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
