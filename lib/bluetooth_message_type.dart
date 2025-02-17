enum BluetoothMessageType {
  confirmConnection,
  disconnect,
  dataTransfer,
  error,
  unknown,
}

BluetoothMessageType getMessageType(String type) {
  switch (type) {
    case "CONFIRM_CONNECTION":
      return BluetoothMessageType.confirmConnection;
    case "DISCONNECT":
      return BluetoothMessageType.disconnect;
    case "DATA_TRANSFER":
      return BluetoothMessageType.dataTransfer;
    case "ERROR":
      return BluetoothMessageType.error;
    default:
      return BluetoothMessageType.unknown;
  }
}