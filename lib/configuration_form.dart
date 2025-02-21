import 'package:flutter/material.dart';
import 'dart:convert';
import 'bluetooth_services.dart'; // Importa BluetoothServices

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
  };

  @override
  void initState() {
    super.initState();
    _formData['macAddress'] = widget.deviceMac;
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Compila il modulo',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
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
                initialValue: widget.deviceMac,
                decoration: InputDecoration(
                  labelText: 'MAC Address',
                  border: OutlineInputBorder(),
                ),
                onSaved: (value) {
                  _formData['macAddress'] = value ?? '';
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
                decoration: InputDecoration(
                  labelText: 'Latitudine',
                  border: OutlineInputBorder(),
                ),
                onSaved: (value) {
                  _formData['lat'] = value ?? '';
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
                  labelText: 'Longitudine',
                  border: OutlineInputBorder(),
                ),
                onSaved: (value) {
                  _formData['long'] = value ?? '';
                },
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Per favore inserisci un valore';
                  }
                  return null;
                },
              ),
              SizedBox(height: 30),
              Center(
                child: ElevatedButton(
                  onPressed: _submitForm,
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(horizontal: 40, vertical: 15),
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
