import 'dart:convert';
import 'dart:typed_data';
import 'package:ble_peripheral/ble_peripheral.dart';

class AdvertisingServices {
  static final ManufacturerData manufacturerData = ManufacturerData(
    manufacturerId: 0x012D,
    data: Uint8List.fromList([
      0x03,
      0x00,
      0x64,
      0x00,
      0x45,
      0x31,
      0x22,
      0xAB,
      0x00,
      0x21,
      0x60,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
    ]),
  );

  static const String serviceBattery = "0000180F-0000-1000-8000-00805F9B34FB";
  static const String characteristicBatteryLevel =
      "00002A19-0000-1000-8000-00805F9B34FB";

  /// Inizializza il plugin BLE
  static Future<void> initialize() async {
    try {
      await BlePeripheral.initialize();
      print("BlePeripheral initialized");
    } catch (e) {
      print("Initialization error: $e");
    }
  }

  /// Aggiunge i servizi da pubblicizzare
  static Future<void> addServices() async {
    try {
      // Aggiunge il Battery Service
      await BlePeripheral.addService(
        BleService(
          uuid: serviceBattery,
          primary: true,
          characteristics: [
            BleCharacteristic(
              uuid: characteristicBatteryLevel,
              properties: [
                CharacteristicProperties.read.index,
                CharacteristicProperties.notify.index,
                CharacteristicProperties.write.index,
              ],
              permissions: [
                AttributePermissions.readable.index,
                AttributePermissions.writeable.index,
              ],
            ),
          ],
        ),
      );

      var notificationControlDescriptor = BleDescriptor(
        uuid: "00002908-0000-1000-8000-00805F9B34FB",
        value: Uint8List.fromList([0, 1]),
        permissions: [
          AttributePermissions.readable.index,
          AttributePermissions.writeable.index,
        ],
      );

      print("Services added successfully");
    } catch (e) {
      print("Error adding services: $e");
    }
  }

  static Future<void> startAdvertising({required String localName}) async {
    try {
      await BlePeripheral.startAdvertising(
        services: [serviceBattery],
        localName: localName,
        // manufacturerData: manufacturerData,
        addManufacturerDataInScanResponse: true,
      );
      print("Advertising started");
    } catch (e) {
      print("Error starting advertising: $e");
    }
  }

  static Future<void> stopAdvertising() async {
    try {
      await BlePeripheral.stopAdvertising();
      print("Advertising stopped");
    } catch (e) {
      print("Error stopping advertising: $e");
    }
  }

  /*
  static Future<void> updateCharacteristic(String value) async {
    try {
      await BlePeripheral.updateCharacteristic(
        characteristicId: characteristicTest,
        value: utf8.encode(value),
      );
      print("Characteristic updated");
    } catch (e) {
      print("Error updating characteristic: $e");
    }
  }
  */
}
