import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'constant.dart';
import 'dart:convert';
import 'bluetooth_message_type.dart';

class BluetoothServices {
  bool _isBluetoothOn = false;
  bool _isConnected = false;

  BluetoothDevice? _connectedDevice;
  BluetoothCharacteristic? _targetCharacteristic;

  bool get isBluetoothOn => _isBluetoothOn;
  bool get isConnected => _isConnected;
  BluetoothDevice? get connectedDevice => _connectedDevice;

  set isConnected(bool value) {
    _isConnected = value;
  }

  Future<bool> getBluetoothStatus() async {
    bool isOn = await FlutterBluePlus.isOn;
    _isBluetoothOn = isOn;
    return isOn;
  }

  Future<void> turnOnBluetooth() async {
    bool isOn = await getBluetoothStatus();
    if (!isOn) {
      await FlutterBluePlus.turnOn();
      _isBluetoothOn = true;
    }
  }

  Future<void> startScan(Function(List<ScanResult>) onScanResult) async {
    await turnOnBluetooth();
    FlutterBluePlus.scanResults.listen(onScanResult);
    await FlutterBluePlus.startScan(timeout: const Duration(seconds: 10));
  }

  Future<void> stopScan() async {
    await FlutterBluePlus.stopScan();
  }

  Future<void> getServices(BluetoothDevice device) async {
    List<BluetoothService> services = await device.discoverServices();
    for (BluetoothService service in services) {
      for (BluetoothCharacteristic characteristic in service.characteristics) {
        if (characteristic.uuid.toString() == UUID_CARATTERISTIC) {
          _targetCharacteristic = characteristic;
          break;
        }
      }
    }
  }

  Future<Map<String, dynamic>> readAndExecuteCharacteristic() async {
    if (_targetCharacteristic == null) {
      return {};
    }
    List<int> value = await _targetCharacteristic!.read();
    String jsonString = utf8.decode(value);

    try {
      Map<String, dynamic> jsonResponse = jsonDecode(jsonString);
      print("jsonResponse: $jsonResponse");
      handleCharacteristicResponse(jsonResponse);
      return jsonResponse;
    } catch (e) {
      print("Errore durante la decodifica del JSON: $e");
      return {"type": "UNKNOWN", "message": jsonString};
    }
  }

  Future<void> writeCharacteristic(String jsonString) async {
    if (_targetCharacteristic == null) {
      return;
    }
    List<int> value = utf8.encode(jsonString);
    await _targetCharacteristic!.write(value);
  }

  Future<void> sendConnectionRequest() async {
    await writeCharacteristic(REQUEST_CONNECTION_MESSAGE);
  }

  Future<bool> confirmConnection() async {
    if (_targetCharacteristic != null) {
      Map<String, dynamic> jsonResponse = await readAndExecuteCharacteristic();
      return jsonResponse["type"] == "CONFIRM_CONNECTION";
    }
    return false;
  }

  bool handleCharacteristicResponse(Map<String, dynamic> jsonResponse) {
    BluetoothMessageType messageType = getMessageType(jsonResponse["type"]);
    switch (messageType) {
      case BluetoothMessageType.confirmConnection:
        _isConnected = true;
        print("Connessione confermata");
        return true;
      case BluetoothMessageType.disconnect:
        print("Disconnessione richiesta");
        disconnectDevice();
        return false;
      case BluetoothMessageType.dataTransfer:
        print("Dati ricevuti: ${jsonResponse["data"]}");
        return false;
      case BluetoothMessageType.error:
        print("Errore ricevuto: ${jsonResponse["message"]}");
        return false;
      case BluetoothMessageType.unknown:
      default:
        print("Tipo di messaggio sconosciuto: ${jsonResponse["type"]}");
        return false;
    }
  }

  Future<bool> connectToDevice(BluetoothDevice device) async {
    int attempt = 0;

    while (attempt < MAXATTEMPTSCONNECTION && !_isConnected) {
      try {
        attempt++;
        await device.connect();
        await getServices(device);
        await sendConnectionRequest();
        await confirmConnection();
      } catch (e) {
        print("Errore durante la connessione: $e");
        await device.disconnect();
      }
    }

    if (!_isConnected) {
      print("Connessione fallita dopo $MAXATTEMPTSCONNECTION tentativi");
    }

    return _isConnected;
  }

  Future<bool> disconnectDevice() async {
    if (_connectedDevice != null) {
      await _connectedDevice!.disconnect();
      _connectedDevice = null;
      _isConnected = false;
    }
      return _isConnected;
  }
}
