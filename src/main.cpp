#include <Arduino.h>
#include <iot_board.h>
#include <WiFi.h>
#include <Preferences.h>
#include "Crypto/CryptoUtils.h"
#include "LoRaMesh/LoRaMesh.h"
#include "LoRaMesh/state_t.h"
#include "BackendService.h"
#include "esp32-hal.h"
#include <iot_board.h>
#include <queue>
using std::queue;

// Coda di messaggi
queue<LoRaMesh_message_t> coda;

// timer per la nuova fetch
unsigned long nextFetch = 0;
// intervallo per ogni fetch
int fetchInterval = 10 * 1000;
// lista di barche a cui bisogna cambiare lo stato
queue<barca> codaBarche;

// Dichiarazione oggetto Preferences
Preferences preferences;

// Dichiarazione del servizio backend
BackendService backendService;

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
        /*while(!coda.empty())*/
        /*{*/
            /*LoRaMesh_message_t message = (LoRaMesh_message_t)coda.front();        */
            /*coda.pop();*/
            /*Serial.print("Destinatario: ");*/
            /*for(int i = 0; i < 7; i++) {*/
            /*    Serial.print(message.targa_destinatario[i]);*/
            /*}*/
            /*Serial.println();*/
            /*String key = backendService.getKeyFromTarga(message.targa_mittente);*/
            /*xorBuffer(&message.payload, sizeof(LoRaMesh_payload_t), (uint8_t*)key.c_str(), KEY_LEN);*/
            /*Serial.println("Sequenza: " + String(message.payload.message_sequence));*/
            /*backendService.sendMessageToBackend(message);*/
            /**/
            /*Serial.println("\n=== Messaggio LoRaMesh ricevuto ===");*/
            /**/
            /*Serial.print("Destinatario: ");*/
            /*for(int i = 0; i < 7; i++) {*/
            /*    Serial.print(message.targa_destinatario[i]);*/
            /*}*/
            /*Serial.println();*/
            /**/
            /*Serial.print("Mittente: ");*/
            /*for(int i = 0; i < 7; i++) {*/
            /*    Serial.print(message.targa_mittente[i]);*/
            /*}*/
            /*Serial.println();*/
            /**/
            /*Serial.println("ID messaggio: " + String(message.message_id));*/
            /*Serial.println("===================================\n");*/
            /**/
            /*String key = backendService.getKeyFromTarga(message.targa_mittente);*/
            /*xorBuffer(&message.payload, sizeof(LoRaMesh_payload_t), (uint8_t*)key.c_str(), KEY_LEN);*/
            /*Serial.println("===================================\n");*/
            /*Serial.println("Posizione: (" + String(message.payload.pos_x, 4) + ", " + String(message.payload.pos_y, 4) + ")");*/
            /*Serial.println("Direzione: " + String(message.payload.direzione) + "°");*/
            /*Serial.println("Stato: " + String(message.payload.stato == st_ormeggio ? "Ormeggiata" : "Rubata"));*/
            /*Serial.println("===================================\n");*/
        /*}*/

        if(millis() > nextFetch) 
        {
            backendService.getBoatsToChange(codaBarche);
            Serial.println("Chiedo le barche al be");
            while(!codaBarche.empty()) 
            {
                barca boat = codaBarche.front();
                codaBarche.pop();

                LoRaMesh_payload_t payload = 
                    {
                        .message_sequence = 0,
                        .pos_x = 0,
                        .pos_y = 0,
                        .direzione = 0,
                    };
                if(boat.stato == "ormeggiata") {
                    payload.stato = st_ormeggio;
                }
                else if(boat.stato == "movimento") {
                    payload.stato = st_movimento;
                }
                LoRaMesh::sendMessage(boat.targa.c_str(), payload, boat.key.c_str());
                LoRaMesh::update();
                Serial.println("Ho inviato il messaggio");
            }
            nextFetch = millis() + fetchInterval;
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
    coda.push(message);
    return;
}
