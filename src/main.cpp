#include <Arduino.h>
#include <iot_board.h>
#include <WiFi.h>
#include <Preferences.h>
#include "LoRaMesh/LoRaMesh.h"
#include "LoRaMesh/state_t.h"
#include "BackendService.h"
#include <iot_board.h>

// Dichiarazione oggetto Preferences
Preferences preferences;

// Dichiarazione del servizio backend

// Configurazione WiFi
const char *ssid = "S24 Ultra di giacomo";
const char *password = "87654321";

// Identificativo della barca/gabbiotto
char targa_gabbiotto[8] = "AB123XY";

// Funzione per gestire i messaggi ricevuti
void onReceive(LoRaMesh_message_t message);

// Funzione per creare e inviare messaggi di test
void inviaMessaggiTest()
{
    Serial.println("\n=== Invio messaggi di test al backend ===");

    LoRaMesh_message_t messageOrmeggiata;

    strncpy(messageOrmeggiata.targa_destinatario, "EM2023", 7);
    strncpy(messageOrmeggiata.targa_mittente, "EM2023", 7);

    messageOrmeggiata.message_id = 1001;
    messageOrmeggiata.payload.stato = st_ormeggio;
    /*messageOrmeggiata.payload.livello_batteria = 85;*/
    messageOrmeggiata.payload.pos_x = 43.7102;
    messageOrmeggiata.payload.pos_y = 10.4135;
    messageOrmeggiata.payload.direzione = 45.5;

    bool success;

    Serial.println("Invio messaggio di barca ormeggiata...");
    // success = backendService.sendMessageToBackend(messageOrmeggiata);
    Serial.println("Risultato invio: " + String(success ? "Successo" : "Fallimento"));

    /*
    Serial.println("Invio notifica cambio stato...");
    success = backendService.sendStateChangeNotification(messageOrmeggiata);
    Serial.println("Risultato invio notifica: " + String(success ? "Successo" : "Fallimento"));
     */

    Serial.println("=== Fine test invio messaggi ===\n");
}

void setup()
{
    Serial.begin(115200);

    IoTBoard::init_serial();
    IoTBoard::init_display();
    IoTBoard::init_leds();

    Serial.println("\n\nTest comunicazione con backend");
    LoRaMesh::init(targa_gabbiotto, onReceive);

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println("\nConnesso al WiFi!");
    Serial.print("Indirizzo IP: ");
    Serial.println(WiFi.localIP());
}

void loop()
{
    LoRaMesh::update();

    if (WiFi.status() == WL_CONNECTED)
    {
        static unsigned long lastSendTime = 0;
        if (millis() - lastSendTime > 30000)
        {
            Serial.println("Dovrei inviare al be");
            inviaMessaggiTest();
        }
    }
    else
    {
        Serial.println("Nessuna connesione a internet");
    }

    delay(1000);
}

void onReceive(LoRaMesh_message_t message)
{
    Serial.println("\n=== Messaggio LoRaMesh ricevuto ===");
    Serial.println("Destinatario: " + String(message.targa_destinatario));
    Serial.println("Mittente: " + String(message.targa_mittente));
    Serial.println("ID messaggio: " + String(message.message_id));
    /*Serial.println("Livello batteria: " + String(message.payload.livello_batteria) + "%");*/
    Serial.println("Posizione: (" + String(message.payload.pos_x, 4) + ", " + String(message.payload.pos_y, 4) + ")");
    Serial.println("Direzione: " + String(message.payload.direzione) + "°");
    Serial.println("Stato: " + String(message.payload.stato == st_ormeggio ? "Ormeggiata" : "Rubata"));
    Serial.println("===================================\n");

    return;
}
