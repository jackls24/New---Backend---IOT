import 'package:flutter/material.dart';
import 'home_screen.dart';
import 'bluetooth_settings_screen.dart';
import 'package:provider/provider.dart';
import 'app_state.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  _MainScreenState createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  // Lista delle schermate
  final List<Widget> _screens = [
    const HomeScreen(),
    const BluetoothSettingsScreen(),
  ];

  // Cambia schermata in base all'indice selezionato
  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bluetooth App'),
      ),
      // Usa IndexedStack per mantenere lo stato delle schermate
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      // BottomNavigationBar per navigare tra le schermate
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Impostazioni',
          ),
        ],
      ),
    );
  }
}