import 'package:flutter/material.dart';
import 'dart:convert';

class ConfigurationForm extends StatefulWidget {
  const ConfigurationForm({super.key});

  @override
  _ConfigurationFormState createState() => _ConfigurationFormState();
}

class _ConfigurationFormState extends State<ConfigurationForm> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, String> _formData = {
    'field1': '',
    'field2': '',
    'field3': '',
    'field4': '',
  };

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      String jsonData = jsonEncode(_formData);
      print('JSON Data: $jsonData');
      // Puoi fare qualcosa con il JSON, come inviarlo a un server
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
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 20),
              TextFormField(
                decoration: InputDecoration(
                  labelText: 'Titolo 1',
                  border: OutlineInputBorder(),
                ),
                onSaved: (value) {
                  _formData['field1'] = value ?? '';
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
                  labelText: 'Titolo 2',
                  border: OutlineInputBorder(),
                ),
                onSaved: (value) {
                  _formData['field2'] = value ?? '';
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
                  labelText: 'Titolo 3',
                  border: OutlineInputBorder(),
                ),
                onSaved: (value) {
                  _formData['field3'] = value ?? '';
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
                  labelText: 'Titolo 4',
                  border: OutlineInputBorder(),
                ),
                onSaved: (value) {
                  _formData['field4'] = value ?? '';
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