import 'package:flutter/material.dart';
import 'package:flutter_application_3/configuration_form.dart';
import 'package:flutter_application_3/home_screen.dart';
import 'main_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Bluetooth App',
      theme: ThemeData.light(), // Tema chiaro
      darkTheme: ThemeData.dark(), // Tema scuro
      themeMode: ThemeMode.dark, // Imposta il tema su scuro
      home: const MainScreen(),
    );
  }
}