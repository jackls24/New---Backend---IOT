import 'package:flutter/material.dart';
import 'package:amazon_cognito_identity_dart_2/cognito.dart';
import 'auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);
  
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController     = TextEditingController();
  final _passwordController  = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController  = TextEditingController();
  late final CognitoManager _cognitoManager;
  bool _isLogin = true;

  @override
  void initState() {
    super.initState();
    _cognitoManager = CognitoManager();
    _initCognitoManager();
  }

  Future<void> _initCognitoManager() async {
    await _cognitoManager.init();
  }

  void _showErrorPopup(String error) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Row(
            children: const [
              Icon(Icons.error, color: Colors.red),
              SizedBox(width: 8),
              Text("Errore"),
            ],
          ),
          content: Text(error),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('CHIUDI'),
            ),
          ],
        );
      },
    );
  }

  void _showEmailVerificationDialog(String email) {
    final TextEditingController confirmationCodeController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Verifica Email"),
          content: TextField(
            controller: confirmationCodeController,
            decoration: const InputDecoration(
              labelText: "Inserisci il codice di verifica",
            ),
          ),
          actions: [
            TextButton(
              onPressed: () async {
                final code = confirmationCodeController.text;
                try {
                  bool confirmed = await _cognitoManager.confirmUser(email, code);
                  if (confirmed) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Email verificata con successo!"))
                    );
                    Navigator.of(context).pop();
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Errore nella verifica dell'email"))
                    );
                  }
                } catch (e) {
                  _showErrorPopup(e.toString());
                }
              },
              child: const Text("Conferma"),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text("Annulla"),
            ),
          ],
        );
      },
    );
  }

  void _signUp() async {
    final email     = _emailController.text;
    final password  = _passwordController.text;
    final firstName = _firstNameController.text;
    final lastName  = _lastNameController.text;
    
    try {
      await _cognitoManager.signUp(email, password, firstName, lastName);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Registrazione avvenuta con successo!')),
      );
      // Mostra il dialog per la verifica dell'email
      _showEmailVerificationDialog(email);
      setState(() {
        _isLogin = true;
      });
    } on CognitoServiceException catch (e) {
      _showErrorPopup(e.message);
    }
  }

  void _signIn() async {
    final email    = _emailController.text;
    final password = _passwordController.text;
    
    try {
      final user = await _cognitoManager.signIn(email, password);
      print("User signed in: ${user.toString()}");
      print("User claims: ${user.claims.toString()}");
        
      Navigator.pushReplacementNamed(context, '/main');

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Accesso avvenuto con successo!')),
      );
      // Naviga alla schermata principale o esegui altre azioni qui
    } on CognitoServiceException catch (e) {
      // Se l'errore contiene "Confirmation" mostra il dialog per la verifica,
      // altrimenti mostra il pop-up di errore.
      if (e.message.contains("Confirmation") || 
          e.message.contains("not confirmed")) {
        _showEmailVerificationDialog(email);
      } else {
        _showErrorPopup(e.message);
      }
    }
  }

  void _toggleFormMode() {
    setState(() {
      _isLogin = !_isLogin;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Background a gradiente
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF2196F3), Color(0xFF21CBF3)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Card(
              elevation: 8,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16.0),
              ),
              margin: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _isLogin ? 'Accedi' : 'Registrati',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 24.0),
                    if (!_isLogin) ...[
                      TextField(
                        controller: _firstNameController,
                        decoration: const InputDecoration(
                          labelText: 'Nome',
                          prefixIcon: Icon(Icons.person),
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      TextField(
                        controller: _lastNameController,
                        decoration: const InputDecoration(
                          labelText: 'Cognome',
                          prefixIcon: Icon(Icons.person_outline),
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 16.0),
                    ],
                    TextField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        prefixIcon: Icon(Icons.email),
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16.0),
                    TextField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'Password',
                        prefixIcon: Icon(Icons.lock),
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 24.0),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 48.0, vertical: 12.0,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(24.0),
                        ),
                      ),
                      onPressed: _isLogin ? _signIn : _signUp,
                      child: Text(
                        _isLogin ? 'Login' : 'Sign Up',
                        style: const TextStyle(fontSize: 18),
                      ),
                    ),
                    const SizedBox(height: 12.0),
                    TextButton(
                      onPressed: _toggleFormMode,
                      child: Text(
                        _isLogin
                            ? 'Non sei registrato? Registrati'
                            : 'Hai già un account? Accedi',
                        style: const TextStyle(fontSize: 16),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

