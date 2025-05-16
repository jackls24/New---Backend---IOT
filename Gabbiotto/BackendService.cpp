#include "BackendService.h"
#include "ArduinoJson/Object/JsonPair.hpp"
#include <queue>

BackendService::BackendService()
{
    Serial.println("Inizializzazione BackendService su " + baseUrl);
}

String BackendService::formatTargaString(const char *targa, int length)
{
    char targa_temp[length + 1];
    strncpy(targa_temp, targa, length);
    targa_temp[length] = '\0';
    return String(targa_temp);
}

bool BackendService::sendMessageToBackend(const LoRaMesh_message_t &message)
{
    HTTPClient http;

    String targa_mittente = formatTargaString(message.targa_mittente, 7);
    String endpoint = baseUrl + "/boats/targa/" + targa_mittente;

    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");

    // Creazione payload JSON
    DynamicJsonDocument doc(1024);
    doc["targa_mittente"] = targa_mittente;
    doc["message_id"] = message.message_id;
    doc["direzione"] = message.payload.direzione;
    doc["posizione_x"] = message.payload.pos_x;
    doc["posizione_y"] = message.payload.pos_y;
    doc["stato"] = message.payload.stato == st_ormeggio ? "ormeggiata" : "rubata";
    doc["timestamp"] = millis();

    String jsonPayload;
    serializeJson(doc, jsonPayload);
    Serial.println("sendMessageToBackend - Payload: " + jsonPayload);

    int httpResponseCode = http.PUT(jsonPayload);

    if (httpResponseCode > 0)
    {
        String response = http.getString();

        if (response.length() > 0)
        {
            Serial.println("sendMessageToBackend - risposta: " + response);

            if (response.startsWith("{") || response.startsWith("["))
            {
                DynamicJsonDocument respDoc(1024);
                DeserializationError error = deserializeJson(respDoc, response);
                if (!error)
                {
                    Serial.println("Risposta JSON formattata:");
                    serializeJsonPretty(respDoc, Serial);
                    Serial.println();
                }
            }
        }
        else
        {
            Serial.println("Risposta vuota");
        }
    }
    else
    {
        Serial.print("ERRORE: ");
        Serial.println(http.errorToString(httpResponseCode));
    }

    // Chiusura connessione
    http.end();

    bool success = httpResponseCode >= 200 && httpResponseCode < 300;
    return success;
}

String BackendService::getKeyFromTarga(String targa)
{
    HTTPClient http;
    String key;

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
        /*Serial.println("Risposta completa: " + response);*/

        DynamicJsonDocument responseDoc(1024);
        DeserializationError error = deserializeJson(responseDoc, response);

        if (error)
        {
            Serial.print("Errore deserializeJson(): ");
            Serial.println(error.c_str());
            http.end();
            return "";
        }

        /*Serial.println("Contenuto JSON deserializzato:");*/
        serializeJsonPretty(responseDoc, Serial);

        if (responseDoc.containsKey("key"))
        {
            key = responseDoc["key"].as<String>();
            /*Serial.println("Key estratta: " + key);*/
            http.end();
            return key;
        }
        else
        {
            /*Serial.println("Campo 'key' non trovato nella risposta JSON");*/

            for (JsonPair kv : responseDoc.as<JsonObject>())
            {
                /*Serial.print("Campo disponibile: ");*/
                /*Serial.print(kv.key().c_str());*/
                /*Serial.print(" = ");*/
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

    Serial.println("getKeyFromTarga" + key);

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

    /*Serial.println("Invio notifica cambiamento stato: " + jsonPayload);*/

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode <= 0)
    {
        Serial.print("Errore nella richiesta HTTP: ");
        Serial.println(http.errorToString(httpResponseCode));
    }

    http.end();

    return httpResponseCode >= 200 && httpResponseCode < 300;
}

bool BackendService::sendPosition(const LoRaMesh_message_t &message)
{
    if (!message.payload.stato == st_rubata)
        return false;

    HTTPClient http;

    String targa = formatTargaString(message.targa_mittente, 7);

    http.begin(baseUrl + "/location/targa/" + targa);
    http.addHeader("Content-Type", "application/json");

    Serial.println("sendPosition - Targa: " + baseUrl + "/location/targa/" + targa);

    DynamicJsonDocument doc(512);
    doc["targa"] = targa;
    doc["x"] = message.payload.pos_x;
    doc["y"] = message.payload.pos_y;
    doc["direzione"] = message.payload.direzione;
    doc["timestamp"] = message.payload.message_sequence;

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

void BackendService::getBoatsToChange(std::queue<barca> &coda)
{
    HTTPClient http;

    http.begin(baseUrl + "/state");
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.GET();
    if (httpResponseCode > 0)
    {
        String response = http.getString();
        DynamicJsonDocument responseDoc(1024);

        Serial.println("getBoatsToChange Risposta completa: " + response);

        DeserializationError error = deserializeJson(responseDoc, response);

        if (error)
        {
            Serial.print("Errore deserializeJson(): ");
            Serial.println(error.c_str());
            http.end();
            return;
        }

        while (!coda.empty())
        {
            coda.pop();
        }

        for (JsonObject obj : responseDoc.as<JsonArray>())
        {
            const char *targa = obj["targa"];
            const char *key = obj["key"];
            const char *stato = obj["stato"];

            barca nuovaBarca =
                {
                    .targa = String(targa),
                    .key = String(key),
                    .stato = String(stato),
                };
            coda.push(nuovaBarca);
        }
    }
    http.end();
}
