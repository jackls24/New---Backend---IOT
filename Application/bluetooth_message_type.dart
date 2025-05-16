enum BluetoothMessageType {
  confirmConnection,
  requestConnection,
  disconnect,
  dataTransfer,
  error,
  getInfo,
  sendInfo,
  unknown,
}

BluetoothMessageType getMessageType(String type) {
  switch (type) {
    case "CONFIRM_CONNECTION":
      return BluetoothMessageType.confirmConnection;
    case "REQUEST_CONNECTION":
      return BluetoothMessageType.requestConnection;
    case "DISCONNECT":
      return BluetoothMessageType.disconnect;
    case "DATA_TRANSFER":
      return BluetoothMessageType.dataTransfer;
    case "ERROR":
      return BluetoothMessageType.error;
    case "GET_INFO":
      return BluetoothMessageType.getInfo;
    case "SEND_INFO":
      return BluetoothMessageType.sendInfo;
    default:
      return BluetoothMessageType.unknown;
  }
}
