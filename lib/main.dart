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
      theme: ThemeData.light().copyWith(
        scaffoldBackgroundColor: Colors.blue,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.blue
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.blue, 
          selectedItemColor: Colors.white, 
          unselectedItemColor: Colors.grey,
        ),
      ),
      darkTheme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: Colors.blue, // Colore di sfondo per il tema scuro
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.blue, // Colore di sfondo dell'AppBar
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Color.fromARGB(255, 24, 113, 185), // Colore di sfondo dell'AppBar
          selectedItemColor: Colors.white, // Colore dell'elemento selezionato
          unselectedItemColor: Colors.grey, // Colore degli elementi non selezionati
        ),
      ),
      themeMode: ThemeMode.system, // Usa il tema di sistema (chiaro/scuro)
      home: const MainScreen(),
    );
  }
}