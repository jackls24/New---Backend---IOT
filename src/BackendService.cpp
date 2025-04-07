#include "BackendService.h"

BackendService::BackendService()
{
    Serial.println("Inizializzazione BackendService su " + baseUrl);
}

bool BackendService::sendMessageToBackend(const LoRaMesh_message_t &message)
{
    HTTPClient http;

    String endpoint = baseUrl + "/boats/targa/" + String(message.targa_mittente);

    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument doc(1024);
    doc["targa_destinatario"] = message.targa_destinatario;
    doc["targa_mittente"] = message.targa_mittente;
    doc["message_id"] = message.message_id;
    doc["direzione"] = message.payload.direzione;
    doc["posizione_x"] = message.payload.pos_x;
    doc["posizione_y"] = message.payload.pos_y;
    doc["stato"] = message.payload.stato == st_ormeggio ? "ormeggiata" : "rubata";
    doc["timestamp"] = millis();

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    int httpResponseCode = http.PUT(jsonPayload);

    String response = http.getString();

    String key = getKeyFromTarga(message.targa_mittente);

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

    http.end();

    return httpResponseCode >= 200 && httpResponseCode < 300;
}

String BackendService::getKeyFromTarga(String targa)
{
    HTTPClient http;

    char targa_temp[8];
    strncpy(targa_temp, targa.c_str(), 7);
    targa_temp[7] = '\0';

    String endpoint = baseUrl + "/boats/targa/" + String(targa_temp);

    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.GET();

    if (httpResponseCode > 0)
    {
        String response = http.getString();
        Serial.println("Risposta completa: " + response);

        DynamicJsonDocument responseDoc(1024);
        DeserializationError error = deserializeJson(responseDoc, response);

        if (error)
        {
            Serial.print("Errore deserializeJson(): ");
            Serial.println(error.c_str());
            http.end();
            return "";
        }

        Serial.println("Contenuto JSON deserializzato:");
        serializeJsonPretty(responseDoc, Serial);
        Serial.println();

        if (responseDoc.containsKey("key"))
        {
            String key = responseDoc["key"].as<String>();
            Serial.println("Key estratta: " + key);
            http.end();
            return key;
        }
        else
        {
            Serial.println("Campo 'key' non trovato nella risposta JSON");

            for (JsonPair kv : responseDoc.as<JsonObject>())
            {
                Serial.print("Campo disponibile: ");
                Serial.print(kv.key().c_str());
                Serial.print(" = ");
                serializeJson(kv.value(), Serial);
                Serial.println();
            }
        }
    }
    else
    {
        Serial.print("Errore nella richiesta HTTP: ");
        Serial.println(http.errorToString(httpResponseCode));
    }

    http.end();
    return "";
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
    doc["posizione_x"] = message.payload.pos_x; // Corretto: usa pos_x invece di posX
    doc["posizione_y"] = message.payload.pos_y; // Corretto: usa pos_y invece di posY
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
