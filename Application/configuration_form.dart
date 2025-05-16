import 'package:flutter/material.dart';
import 'dart:convert';
import 'bluetooth_services.dart';
import 'advertising_services.dart';
import 'location_service.dart';

class ConfigurationForm extends StatefulWidget {
  final String deviceMac;

  const ConfigurationForm({super.key, required this.deviceMac});

  @override
  _ConfigurationFormState createState() => _ConfigurationFormState();
}

class _ConfigurationFormState extends State<ConfigurationForm> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, String> _formData = {
    'targa': '',
    'macAddress': '',
    'dispName': '',
    'lat': '',
    'long': '',
    'serviceID': AdvertisingServices.serviceID,
  };

  final TextEditingController _latController = TextEditingController();
  final TextEditingController _longController = TextEditingController();

  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();

    // Dopo 3 secondi, nasconde il loading viene annullato
    Future.delayed(Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _latController.dispose();
    _longController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    print("Location D");

    final locationData = await LocationService.getCurrentLocation();

    print("Location Data: $locationData");
    if (locationData == null ||
        locationData.latitude == null ||
        locationData.longitude == null) {
      print(" ottenere la posizione");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Impossibile ottenere la posizione")),
      );
      return;
    }

    setState(() {
      _formData['lat'] = locationData.latitude?.toString() ?? '';
      _formData['long'] = locationData.longitude?.toString() ?? '';
      _latController.text = _formData['lat']!;
      _longController.text = _formData['long']!;
      _isLoading = false;
    });
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      String jsonData = jsonEncode(_formData);
      BluetoothServices.sendInfo(_formData);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Per favore, compila tutti i campi')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Configuration Form')),
      body:
          _isLoading
              ? Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Compila il modulo',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 20),
                      TextFormField(
                        decoration: InputDecoration(
                          labelText: 'Targa',
                          border: OutlineInputBorder(),
                        ),
                        onSaved: (value) {
                          _formData['targa'] = value ?? '';
                        },
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Per favore inserisci un valore';
                          }
                          return null;
                        },
                      ),
                      SizedBox(height: 20),
                      TextFormField(
                        decoration: InputDecoration(
                          labelText: 'Nome Dispositivo',
                          border: OutlineInputBorder(),
                        ),
                        onSaved: (value) {
                          _formData['dispName'] = value ?? '';
                        },
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Per favore inserisci un valore';
                          }
                          return null;
                        },
                      ),
                      SizedBox(height: 20),
                      TextFormField(
                        controller: _latController,
                        decoration: InputDecoration(
                          labelText: 'Latitudine',
                          border: OutlineInputBorder(),
                        ),
                        readOnly: true,
                      ),
                      SizedBox(height: 20),
                      TextFormField(
                        controller: _longController,
                        decoration: InputDecoration(
                          labelText: 'Longitudine',
                          border: OutlineInputBorder(),
                        ),
                        readOnly: true, // Campo non modificabile
                      ),
                      SizedBox(height: 20),
                      TextFormField(
                        initialValue: _formData['serviceID'],
                        decoration: InputDecoration(
                          labelText: 'Service ID',
                          border: OutlineInputBorder(),
                        ),
                        readOnly: true, // Campo non modificabile
                      ),
                      SizedBox(height: 30),
                      Center(
                        child: ElevatedButton(
                          onPressed: _submitForm,
                          style: ElevatedButton.styleFrom(
                            padding: EdgeInsets.symmetric(
                              horizontal: 40,
                              vertical: 15,
                            ),
                            textStyle: TextStyle(fontSize: 18),
                          ),
                          child: Text('Submit'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
    );
  }
}
