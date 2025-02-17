import 'dart:convert';

const String UUID_CARATTERISTIC = "87654321-4321-4321-4321-210987654321";

final String REQUEST_CONNECTION_MESSAGE = jsonEncode({"type": "REQUEST_CONNECTION"});
final String CONFIRM_CONNECTION_MESSAGE = jsonEncode({"type": "CONFIRM_CONNECTION"});
final String DISCONNECT_MESSAGE = jsonEncode({"type": "DISCONNECT"});
final String DATA_TRANSFER_MESSAGE = jsonEncode({"type": "DATA_TRANSFER", "data": ""});
final String ERROR_MESSAGE = jsonEncode({"type": "ERROR", "message": ""});


const int MAXATTEMPTSCONNECTION = 3;