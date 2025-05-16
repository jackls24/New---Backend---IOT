import 'package:amazon_cognito_identity_dart_2/cognito.dart';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'session.dart'; // Assicurati di importare la classe Session

class CognitoServiceException implements Exception {
  final String message;
  CognitoServiceException(this.message);
}

class User {
  String username;
  bool userConfirmed;
  bool sessionValid;
  String? userSub;
  String givenName;   // Nome
  String familyName;  // Cognome
  Map<String, dynamic> claims;

  User(
    this.username,
    this.userConfirmed,
    this.sessionValid,
    this.userSub,
    this.givenName,
    this.familyName,
    this.claims,
  );
}

class CognitoManager {
  late final CognitoUserPool userPool;
    static User? currentUser;


  CognitoManager();

  Future<void> init() async {
    userPool = CognitoUserPool(
      'eu-north-1_KBBdKAObM',
      '56181osqu94q737ng5qjf91apb',
    );
  }

  Future<User> signUp(String email, String password, String firstName, String lastName) async {
    final userAttributes = [
      AttributeArg(name: 'email', value: email),
      AttributeArg(name: 'given_name', value: firstName),
      AttributeArg(name: 'family_name', value: lastName),
      // Add other attributes as needed
    ];

    try {
      final result = await userPool.signUp(
        email,
        password,
        userAttributes: userAttributes,
      );
      return User(
        email,
        result.userConfirmed ?? false,
        false,
        result.userSub,
        firstName,
        lastName,
        {},
      );
    } catch (e) {
      throw CognitoServiceException(e.toString());
    }
  }

  Future<bool> confirmUser(String email, String confirmationCode) async {
    final cognitoUser = CognitoUser(email, userPool);
    try {
      return await cognitoUser.confirmRegistration(confirmationCode);
    } catch (e) {
      throw CognitoServiceException(e.toString());
    }
  }

  Future<void> signOut() async {
    if (currentUser == null) return;
    final cognitoUser = CognitoUser(currentUser!.username, userPool);
    await cognitoUser.signOut();
    currentUser = null;
  }

  Future<User> signIn(String email, String password) async {
    final cognitoUser = CognitoUser(email, userPool);
    final authDetails = AuthenticationDetails(
      username: email,
      password: password,
    );

    try {
      final session = await cognitoUser.authenticateUser(authDetails);

      if (session == null) {
        throw CognitoClientException("session not found");
      }
      var claims = <String, dynamic>{};
      claims.addAll(session.idToken.payload);
      claims.addAll(session.accessToken.payload);

        final givenName = claims['given_name'] ?? '';
       final familyName = claims['family_name'] ?? '';

      currentUser = User(
      email,
      true,
      session.isValid(),
      session.idToken.getSub() ?? "",
      givenName,
      familyName,
      claims,
    );

    // Salva solo l'accessToken in modo persistente
    await Session.saveUserSession({'accessToken': session.accessToken.jwtToken});

      return currentUser!;

    } catch (e) {
      throw CognitoServiceException(e.toString());
    }
  }

  String calculateSecretHash(
    String clientId,
    String clientSecret,
    String username,
  ) {
    final hmacSha256 = Hmac(sha256, utf8.encode(clientSecret)); // HMAC-SHA256
    final digest = hmacSha256.convert(utf8.encode(username + clientId));
    return base64Encode(digest.bytes);
  }
}
