// ignore_for_file: avoid_print

import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'constant.dart';
import 'dart:async';
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

  Future<Map<String, dynamic>> readCharacteristic() async {
    if (_targetCharacteristic == null || !_isConnected) {
      return {};
    }
    List<int> value = await _targetCharacteristic!.read();
    String jsonString = utf8.decode(value);

    try {
      Map<String, dynamic> jsonResponse = jsonDecode(jsonString);
      return jsonResponse;
    } catch (e) {
      print("Errore durante la decodifica del JSON: $e");
      return {"type": "UNKNOWN", "message": jsonString};
    }
  }

  Future<void> writeCharacteristic(String jsonString) async {
    if (_targetCharacteristic == null || !_isConnected) {
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
      Map<String, dynamic> jsonResponse = await readCharacteristic();
      return jsonResponse["type"] == "CONFIRM_CONNECTION";
    }
    return false;
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
        onConnectionStateChanged(device);
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

  void onConnectionStateChanged(BluetoothDevice device) {
    device.connectionState.listen((BluetoothConnectionState state) {
      switch (state) {
        case BluetoothConnectionState.connected:
          _isConnected = true;
          _connectedDevice = device;
          print("Dispositivo connesso: ${device.name}");
          break;
        case BluetoothConnectionState.disconnected:
          _isConnected = false;
          _connectedDevice = null;
          print("Dispositivo disconnesso: ${device.name}");
          break;
        case BluetoothConnectionState.connecting:
          print("Connessione in corso: ${device.name}");
          break;
        case BluetoothConnectionState.disconnecting:
          print("Disconnessione in corso: ${device.name}");
          break;
      }
    });
  }

  Future<void> subscribeToCharacteristic() async {
    print("_targetCharacteristic: subscribeToCharacteristic $_targetCharacteristic");
    print("_isConnected subscribeToCharacteristic: $_isConnected");

    if (_targetCharacteristic == null ||
        !_isConnected) {
      print("subscribeToCharacteristic Dispositivo non connesso o caratteristica non trovata");
      return;
    }

    await _targetCharacteristic!.setNotifyValue(true);

    _targetCharacteristic!.onValueReceived.listen((value) {
      String jsonString = utf8.decode(value);
      print("subscribeToCharacteristic Valore ricevuto subscribeToCharacteristic: $jsonString");

      try {
        Map<String, dynamic> jsonResponse = jsonDecode(jsonString);
        handleCharacteristicResponse(jsonResponse);
      } catch (e) {
        print("Errore durante la decodifica del JSON: $e");
      }
    });
  }
  
  Future<Map<String, dynamic>> requestInfo() async {
    await writeCharacteristic(GET_INFO_MESSAGE);
    Map<String, dynamic> jsonResponse = await readCharacteristic();
    
    if (jsonResponse.isEmpty || jsonResponse.length == 1 && jsonResponse.containsKey("type")) {
      return {};
    }
    return jsonResponse;
  }

  bool handleCharacteristicResponse(Map<String, dynamic> jsonResponse) {
    BluetoothMessageType messageType = getMessageType(jsonResponse["type"]);
    switch (messageType) {
      case BluetoothMessageType.confirmConnection:
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
      case BluetoothMessageType.getInfo:
        //getInfo(jsonResponse);
        return false;
      case BluetoothMessageType.unknown:
      default:
        print("Tipo di messaggio sconosciuto: ${jsonResponse["type"]}");
        return false;
    }
  }
}
