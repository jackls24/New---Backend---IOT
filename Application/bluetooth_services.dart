// ignore_for_file: avoid_print

import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'constant.dart';
import 'dart:async';
import 'dart:convert';
import 'bluetooth_message_type.dart';
import 'models/boat_info.dart'; // Importa BoatInfo
import 'package:flutter/foundation.dart'; // Importa ValueNotifier

class BluetoothServices {
  // Singleton instance
  static final BluetoothServices _instance = BluetoothServices._internal();

  // Private constructor
  BluetoothServices._internal();

  // Factory constructor
  factory BluetoothServices() {
    return _instance;
  }

  static bool _isBluetoothOn = false;
  static bool _isConnected = false;
  static bool _isVirtualConnected = false;

  static BluetoothDevice? _connectedDevice;
  static BluetoothCharacteristic? _targetCharacteristic;

  static bool get isBluetoothOn => _isBluetoothOn;
  static bool get isConnected => _isConnected;
  static BluetoothDevice? get connectedDevice => _connectedDevice;

  static set isConnected(bool value) {
    _isConnected = value;
  }

  static final ValueNotifier<bool> isConnectedNotifier = ValueNotifier<bool>(
    false,
  );

  static Future<bool> getBluetoothStatus() async {
    bool isOn = await FlutterBluePlus.isOn;
    _isBluetoothOn = isOn;
    return isOn;
  }

  static Future<void> turnOnBluetooth() async {
    bool isOn = await getBluetoothStatus();
    if (!isOn) {
      await FlutterBluePlus.turnOn();
      _isBluetoothOn = true;
    }
  }

  static Future<void> startScan(Function(List<ScanResult>) onScanResult) async {
    await turnOnBluetooth();
    FlutterBluePlus.scanResults.listen(onScanResult);
    await FlutterBluePlus.startScan(timeout: const Duration(seconds: 10));
  }

  static Future<void> stopScan() async {
    await FlutterBluePlus.stopScan();
  }

  static Future<void> getServices(BluetoothDevice device) async {
    List<BluetoothService> services = await device.discoverServices();
    for (BluetoothService service in services) {
      for (BluetoothCharacteristic characteristic in service.characteristics) {
        if (characteristic.uuid.toString() == UUID_CARATTERISTIC) {
          print("_targetCharacteristic settato");
          _targetCharacteristic = characteristic;
          break;
        }
      }
    }
  }

  static Future<Map<String, dynamic>> readCharacteristic() async {
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

  static Future<void> writeCharacteristic(String jsonString) async {
    if (_targetCharacteristic == null) {
      return;
    }

    List<int> value = utf8.encode(jsonString);
    print("writeCharacteristic write: $jsonString");
    await _targetCharacteristic!.write(value);
  }

  static Future<void> sendConnectionRequest() async {
    await writeCharacteristic(REQUEST_CONNECTION_MESSAGE);
  }

  static Future<bool> confirmConnection() async {
    if (_targetCharacteristic != null) {
      Map<String, dynamic> jsonResponse = await readCharacteristic();
      return jsonResponse["type"] == "CONFIRM_CONNECTION";
    }
    return false;
  }

  static Future<bool> connectToDevice(BluetoothDevice device) async {
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
        await device.disconnect();
        print("Errore durante la connessione: $e");
        throw Exception("Errore durante la connessione: $e");
      }
    }

    if (!_isConnected) {
      print("Connessione fallita dopo $MAXATTEMPTSCONNECTION tentativi");
    }

    return _isConnected;
  }

  static Future<bool> disconnectDevice() async {
    if (_connectedDevice != null) {
      await _connectedDevice!.disconnect();
      _connectedDevice = null;
      _isConnected = false;
      _isVirtualConnected = false;
    }
    return _isConnected;
  }

  static void onConnectionStateChanged(BluetoothDevice device) {
    device.connectionState.listen((BluetoothConnectionState state) {
      switch (state) {
        case BluetoothConnectionState.connected:
          _isConnected = true;
          _connectedDevice = device;
          isConnectedNotifier.value = true;

          print("Dispositivo connesso: ${device.name}");
          break;
        case BluetoothConnectionState.disconnected:
          _isConnected = false;
          _connectedDevice = null;
          isConnectedNotifier.value = false;
          _isVirtualConnected = false;
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

  static Future<void> subscribeToCharacteristic() async {
    print(
      "_targetCharacteristic: subscribeToCharacteristic $_targetCharacteristic",
    );
    print("_isConnected subscribeToCharacteristic: $_isConnected");

    if (_targetCharacteristic == null || !_isConnected) {
      print(
        "subscribeToCharacteristic Dispositivo non connesso o caratteristica non trovata",
      );
      return;
    }

    await _targetCharacteristic!.setNotifyValue(true);

    _targetCharacteristic!.onValueReceived.listen((value) {
      String jsonString = utf8.decode(value);
      print(
        "subscribeToCharacteristic Valore ricevuto subscribeToCharacteristic: $jsonString",
      );

      try {
        Map<String, dynamic> jsonResponse = jsonDecode(jsonString);
        handleCharacteristicResponse(jsonResponse);
      } catch (e) {
        print("Errore durante la decodifica del JSON: $e");
      }
    });
  }

  static Future<BoatInfo?> requestInfo() async {
    await writeCharacteristic(GET_INFO_MESSAGE);
    Map<String, dynamic> jsonResponse = await readCharacteristic();

    if (jsonResponse.isEmpty ||
        jsonResponse.length == 1 && jsonResponse.containsKey("type")) {
      return null;
    }

    if (jsonResponse.containsKey("data")) {
      return BoatInfo.fromJson(jsonResponse["data"]);
    }

    return null;
  }

  static Future<void> sendInfo(Map<String, dynamic> info) async {
    //await writeCharacteristic(SEND_INFO_MESSAGE);
    print("info: $info");
    String jsonString = jsonEncode({"type": "SEND_INFO", "data": info});
    print("sendInfo: $jsonString");
    await writeCharacteristic(jsonString);
  }

  static Future<void> sendSetPosition(double lat, double long) async {
    if (!_isVirtualConnected) {
      return;
    }

    String jsonString = jsonEncode({
      "type": "SET_POSITION",
      "data": {"lat": lat, "long": long},
    });
    print("Invio messaggio SET_POSITION: $jsonString");
    await writeCharacteristic(jsonString);
  }

  static bool handleCharacteristicResponse(Map<String, dynamic> jsonResponse) {
    BluetoothMessageType messageType = getMessageType(jsonResponse["type"]);
    switch (messageType) {
      case BluetoothMessageType.confirmConnection:
        _isVirtualConnected = true;

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
      case BluetoothMessageType.sendInfo:
        print("Informazioni inviate correttamente");
        return true;
      case BluetoothMessageType.unknown:
      default:
        print("Tipo di messaggio sconosciuto: ${jsonResponse["type"]}");
        return false;
    }
  }
}
