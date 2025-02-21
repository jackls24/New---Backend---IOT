// ignore_for_file: avoid_print

import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'constant.dart';
import 'dart:async';
import 'dart:convert';
import 'bluetooth_message_type.dart';
import 'models/boat_info.dart'; // Importa BoatInfo
import 'package:flutter/foundation.dart'; // Importa ValueNotifier
import 'package:shared_preferences/shared_preferences.dart'; // Importa SharedPreferences
import 'dart:io'; // Importa File

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
    try {
      List<int> value = await _targetCharacteristic!.read();
      String jsonString = utf8.decode(value);

      Map<String, dynamic> jsonResponse = jsonDecode(jsonString);
      return jsonResponse;
    } catch (e) {
      print("Errore durante la decodifica del JSON: $e");
      return {"type": "UNKNOWN", "message": e.toString()};
    }
  }

  static Future<bool> writeCharacteristic(String jsonString) async {
    try {
      if (_targetCharacteristic == null || !_isConnected) {
        return false;
      }

      List<int> value = utf8.encode(jsonString);
      await _targetCharacteristic!.write(value);
      return true;
    } catch (e) {
      print("Errore durante la scrittura del JSON: $e");
      return false;
    }
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

  static Future<void> saveConnectedDevice(BluetoothDevice device) async {
    try {
      final file = File('/Users/giacomo/Documents/flutter_application_3/remoteId.txt');
      await file.writeAsString(device.remoteId.toString());
      print("saveConnectedDevice: Saved: ${device.remoteId.toString()}");
    } catch (e) {
      print("Errore durante il salvataggio del dispositivo connesso: $e");
    }
  }

  static Future<BluetoothDevice?> getSavedConnectedDevice() async {
    try {
      final file = File('/Users/giacomo/Documents/flutter_application_3/remoteId.txt');
      if (await file.exists()) {
        final remoteId = await file.readAsString();
        return BluetoothDevice.fromId(remoteId);
      }
    } catch (e) {
      print("Errore durante il recupero del dispositivo connesso: $e");
    }
    return null;
  }

  static Future<void> autoConnectToSavedDevice() async {
    BluetoothDevice? device = await getSavedConnectedDevice();
    print("autoConnectToSavedDevice device: $device");
    if (device != null) {
      await autoConnectToDevice(device);
    }
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
        await saveConnectedDevice(device); // Salva il dispositivo connesso
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

  static Future<void> autoConnectToDevice(BluetoothDevice device) async {
    try {
      await device.connect(autoConnect: true, mtu: null);
      await device.connectionState
          .where((val) => val == BluetoothConnectionState.connected)
          .first;
      await getServices(device);
      await sendConnectionRequest();
      await confirmConnection();
      onConnectionStateChanged(device);
    } catch (e) {
      await device.disconnect();
      print("Errore durante la auto connessione: $e");
      throw Exception("Errore durante la auto connessione: $e");
    }
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
          isConnectedNotifier.value = false;
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
      print("BoatInfo :$jsonResponse");
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
