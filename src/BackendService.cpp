#include "BackendService.h"

BackendService::BackendService()
{
    Serial.println("Inizializzazione BackendService su " + baseUrl);
}

bool BackendService::sendMessageToBackend(const LoRaMesh_message_t &message)
{
    HTTPClient http;

    String endpoint = baseUrl + "/boats/targa/" + String(message.targa_mittente);

    // Debug della richiesta - URL
    Serial.println("\n==== DEBUG RICHIESTA HTTP ====");
    Serial.println("URL: " + endpoint);

    // Headers
    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");

    // Body della richiesta
    DynamicJsonDocument doc(1024);
    doc["targa_destinatario"] = message.targa_destinatario;
    doc["targa_mittente"] = message.targa_mittente;
    doc["message_id"] = message.message_id;
    doc["direzione"] = message.payload.direzione;
    /*doc["livello_batteria"] = message.payload.livello_batteria;*/
    doc["posizione_x"] = message.payload.pos_x;
    doc["posizione_y"] = message.payload.pos_y;
    doc["stato"] = message.payload.stato == st_ormeggio ? "ormeggiata" : "rubata";
    doc["timestamp"] = millis();

    String jsonPayload;
    serializeJson(doc, jsonPayload);
    Serial.println("Body: " + jsonPayload);
    Serial.println("============================\n");

    // Invio della richiesta
    int httpResponseCode = http.PUT(jsonPayload);

    // Debug della risposta
    Serial.println("\n==== DEBUG RISPOSTA HTTP ====");
    Serial.println("Codice di stato: " + String(httpResponseCode));

    String response = http.getString();
    Serial.println("Body risposta: " + response);

    if (httpResponseCode > 0)
    {
        String response = http.getString();
        Serial.println("Body risposta: " + response);
    }
    else
    {
        Serial.print("Errore: ");
        Serial.println(http.errorToString(httpResponseCode));
    }
    Serial.println("============================\n");

    // Chiudi connessione
    http.end();

    // Verifica se la richiesta ha avuto successo
    return httpResponseCode >= 200 && httpResponseCode < 300;
}
bool BackendService::sendStateChangeNotification(const LoRaMesh_message_t &message)
{
    HTTPClient http;

    // Endpoint per notifiche di cambio stato
    String endpoint = baseUrl + "/boats/targa/" + String(message.targa_mittente);
    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument doc(512);
    doc["targa_barca"] = message.targa_mittente;
    doc["stato_attuale"] = message.payload.stato == st_ormeggio ? "ormeggiata" : "rubata";
    doc["posizione_x"] = message.payload.pos_x;                 // Corretto: usa pos_x invece di posX
    doc["posizione_y"] = message.payload.pos_y;                 // Corretto: usa pos_y invece di posY
    /*doc["livello_batteria"] = message.payload.livello_batteria; // Aggiunto livello_batteria*/

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    Serial.println("Invio notifica cambiamento stato: " + jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode <= 0)
    {
        Serial.print("Errore nella richiesta HTTP: ");
        Serial.println(http.errorToString(httpResponseCode));
    }

    http.end();

    return httpResponseCode >= 200 && httpResponseCode < 300;
}

bool BackendService::sendPositionUpdate(const LoRaMesh_message_t &message)
{
    HTTPClient http;

    // Endpoint per aggiornamenti posizione
    http.begin(baseUrl + "/api/position-update");
    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument doc(512);
    doc["targa_barca"] = message.targa_mittente;
    doc["posizione_x"] = message.payload.pos_x; // Corretto: usa pos_x invece di posX
    doc["posizione_y"] = message.payload.pos_y; // Corretto: usa pos_y invece di posY
    doc["direzione"] = message.payload.direzione;
    /*doc["livello_batteria"] = message.payload.livello_batteria; // Aggiunto livello_batteria*/

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    Serial.println("Invio aggiornamento posizione: " + jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode <= 0)
    {
        Serial.print("Errore nella richiesta HTTP: ");
        Serial.println(http.errorToString(httpResponseCode));
    }

    http.end();

    return httpResponseCode >= 200 && httpResponseCode < 300;
}
