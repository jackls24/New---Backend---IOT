enum BluetoothMessageType {
  confirmConnection,
  disconnect,
  dataTransfer,
  error,
  getInfo,
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
    case "GET_INFO":
      return BluetoothMessageType.getInfo;
    default:
      return BluetoothMessageType.unknown;
  }
}