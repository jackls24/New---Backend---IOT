class BoatInfo {
  final String targa;
  final String macAddress;
  final String dispName;
  final String lat;
  final String long;

  BoatInfo({
    required this.targa,
    required this.macAddress,
    required this.dispName,
    required this.lat,
    required this.long,
  });

  factory BoatInfo.fromJson(Map<String, dynamic> json) {
    return BoatInfo(
      targa: json['targa'] ?? '',
      macAddress: json['macAddress'] ?? '',
      dispName: json['dispName'] ?? '',
      lat: json['lat'] ?? '',
      long: json['long'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'targa': targa,
      'macAddress': macAddress,
      'dispName': dispName,
      'lat': lat,
      'long': long,
    };
  }

  @override
  String toString() {
    return 'BoatInfo(targa: $targa, macAddress: $macAddress, dispName: $dispName, lat: $lat, long: $long)';
  }
}
