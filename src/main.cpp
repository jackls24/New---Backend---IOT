
#include <iot_board.h>
#include <WiFi.h>
#include <WebServer.h>
#include <esp_wifi.h>
#include <Preferences.h>
#include "EloquentTinyML.h"
#include "ormeggio_etichettati.h"
#include "LoRaMesh/LoRaMesh.h"
#include "LoRaMesh/state_t.h"
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLEAdvertisedDevice.h>
#include <BLEScan.h>
#include <ArduinoJson.h>
#include "BLEUtils.h"
#include "sensori.h"
/*#include "lora_utils.h"*/
#include "costants.h"

char targa_gabbiotto[7];

// Callback per la ricezione del messaggio LoRaMesh
void onReceive(LoRaMesh_message_t);

// credenziali WiFi
String ssid = "";
String password = "";

// Access Point
const char *apSSID = "ESP32-AP";
const char *apPassword = "123456789";

WebServer server(80);

void handleRoot()
{
    String html;
    if (WiFi.status() == WL_CONNECTED)
    { // Connessione Wi-Fi attiva
        html = R"rawliteral(
        <!doctypehtml><html lang=en><meta charset=UTF-8><meta content="width=device-width,initial-scale=1"name=viewport><link crossorigin=anonymous href=https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css integrity=sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH rel=stylesheet><script crossorigin=anonymous integrity=sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz src=https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js></script><title>Gabbiotto IoT</title><style>body{width:100%;height:100vh;background-color:#1e2229;color:#fafafa}.elemento-lista{font-size:18px;background-color:#292c33;border-radius:5px;color:#fafafa}.elemento-lista td,.elemento-lista th{padding:8px}.elemento-lista-odd{background-color:transparent}button:hover{background-color:#f01325!important}.bottone-aggiungi:hover{background-color:#2d2d2d!important}form label{padding-top:10px;font-size:22px}</style><body class=bg-blue-600><div class="fade modal"aria-hidden=true aria-labelledby=exampleModalCenterTitle id=exampleModalCenter tabindex=-1><div class="modal-dialog modal-dialog-centered"><div class=modal-content style=background-color:#1e2229><div class=modal-body><div class="d-flex justify-content-end"><button class="bottone-aggiungi btn-close"type=button data-bs-dismiss=modal aria-label=Close style=filter:invert(1)></button></div><form action=/barca method=post><h2>Aggiungi barca</h2><div class=form-div><label for=nome_proprietario>Nome proprietario</label><br><input class=form-control id=nome_proprietario name=nome_proprietario placeholder="nome proprietario"><br><label for=numero_telefonico>Numero telefonico</label><br><input class=form-control id=numero_telefonico name=numero_telefonico placeholder="numero telefonico"><br><label for=indirizzo_lora>Indirizzo LoRa</label><br><input class=form-control id=indirizzo_lora name=indirizzo_lora placeholder="indirizzo LoRa"><br></div><div class="d-flex justify-content-end gap-3 py-3"><button class="btn btn-secondary"type=button data-bs-dismiss=modal>Chiudi</button> <input class="btn btn-primary"type=submit value="Inserisci barca"></div></form></div></div></div></div><div class=container-fluid><div class=row><div class=col-12><div style=position:sticky;top:0;background-color:#1e2229;padding:10px><div class="d-flex justify-content-between"><h1>Lista barche</h1><button class="btn bottone-aggiungi text-white"type=button data-bs-target=#exampleModalCenter data-bs-toggle=modal>Aggiungi +</button></div></div><div><table class=w-100><thead style=position:sticky;top:68px;background-color:#1e2229><tr class="elemento-lista elemento-lista-odd"><th>Nome cliente<th>Numero telefonico<th>Indirizzo LoRa<th style=text-align:end>Comandi<tbody class=lista-barche></table></div></div></div><div class=row></div></div><script>const listaBarche=document.querySelector(".lista-barche");window.onload=async()=>{try{let t=await fetch("/barche");if(!t.ok){let e=await t.text();throw e}let a=await t.text(),l=a.split("\n");for(let n=0;n<l.length-1;n++){let i=document.createElement("tr");i.className="elemento-lista",n%2==1&&(i.className+=" elemento-lista-odd");let o=l[n].split(" ");for(let c=1;c<o.length;c++){let r=document.createElement("td");r.innerHTML=o[c],i.appendChild(r)}let s=document.createElement("td");s.innerHTML=`
                            <form method="post" class="d-flex justify-content-end" action="/eliminaBarca">
                                <input type="hidden" name="id" value="${o[0]}">
                                <button class="btn text-white">X</button>
                            </form>`,i.appendChild(s),listaBarche.appendChild(i)}}catch(d){console.log(d)}};</script>
    )rawliteral";
    }
    else
    { // Connessione Wi-Fi assente
        html = R"rawliteral(
        <!doctypehtml><html lang=en><meta charset=UTF-8><meta content="width=device-width,initial-scale=1"name=viewport><title>Gabbiotto IoT</title><style>*{box-sizing:border-box}body{width:100%;height:100vh;background-color:#1e2229;color:#fcfcfc;display:flex;justify-content:center;align-items:center}form{background-color:#fafafa;border-radius:20px;color:#2d2d2d;padding:100px}.input-text{width:100%;padding:5px;border-radius:5px;border:1px solid #000}.input-submit{margin-top:50px;padding-inline:15px;padding-block:10px;font-size:18px;border-radius:10px;background-color:#9d9d9d;color:#fff;border:1px solid transparent}.input-submit:hover{background-color:grey}.input-submit:active{transform:scale(.95)}label{margin-top:15px;font-size:22px}</style><form action=/wifi method=post><h1>Inserisci i dati della rete Wi-Fi</h1><div class=form-div><label for=ssid>SSID</label><br><input class=input-text id=ssid name=ssid placeholder=SSID><br><label for=password>Password</label><br><input class=input-text id=password name=password placeholder=password type=password><br><div style=display:flex;justify-content:center><input class=input-submit type=submit value=Invio></div></div></form>
        )rawliteral";
    }

    server.send(200, "text/html", html);
}

void aggiungiCredenziali()
{
    if (server.hasArg("ssid") && server.hasArg("password"))
    {
        String ssidPost = server.arg("ssid");
        String passwordPost = server.arg("password");

        WiFi.begin(ssidPost, passwordPost);
        for (int i = 0; i < 5 && WiFi.status() != WL_CONNECTED; i++)
        {
            delay(1000);
            Serial.print(".");
        }
        if (WiFi.status() == WL_CONNECTED)
        {
            display->println("\nConnesso! IP: " + WiFi.localIP().toString());
            display->display();

            server.send(200, "text/plain", "Accesso al Wi-Fi riuscito!");

            preferences.begin("credenzialiWiFi", false);
            ssid = preferences.putString("ssid", ssidPost);
            password = preferences.putString("password", passwordPost);
            preferences.end();

            delay(2000);

            ESP.restart();
        }
        else
        {
            server.send(400, "text/plain", "Errore: Credenziali Errate!");
        }
    }
    else
    {
        server.send(400, "text/plain", "Errore: dati mancanti!");
    }
}

void aggiungiBarca()
{
    if (server.hasArg("nome_proprietario") && server.hasArg("numero_telefonico") && server.hasArg("indirizzo_lora"))
    {
        String nomeProprietario = server.arg("nome_proprietario");
        String numeroTelefonico = server.arg("numero_telefonico");
        String indirizzoLora = server.arg("indirizzo_lora");

        // Apri le preferenze in modalità scrittura
        preferences.begin("barcheDB", false);

        // Ottieni l'indice attuale delle barche
        int count = preferences.getInt("barche_count", 0);

        // Costruisci una stringa con i dati della barca
        String barcaData = nomeProprietario + "," + numeroTelefonico + "," + indirizzoLora;

        // Salva la barca con una chiave unica
        String key = "barca_" + String(count);
        preferences.putString(key.c_str(), barcaData);

        // Incrementa il contatore delle barche
        preferences.putInt("barche_count", count + 1);

        // Chiudi le preferenze
        preferences.end();

        // Risposta al client
        server.send(200, "text/plain", "Barca aggiunta con successo!");
    }
    else
    {
        server.send(400, "text/plain", "Errore: dati mancanti!");
    }
}

void getBarche()
{
    String response = "";

    preferences.begin("barcheDB", true);
    int count = preferences.getInt("barche_count", 0);

    for (int i = 0; i < count; i++)
    {
        String key = "barca_" + String(i);
        String barca = preferences.getString(key.c_str(), "");

        if (barca != "")
        {
            // Divide i dati salvati come "nome,telefono,indirizzo"
            int firstComma = barca.indexOf(',');
            int secondComma = barca.lastIndexOf(',');

            String nome = barca.substring(0, firstComma);
            String telefono = barca.substring(firstComma + 1, secondComma);
            String indirizzo = barca.substring(secondComma + 1);

            // Costruisce la risposta includendo l'ID
            response += String(i) + " " + nome + " " + telefono + " " + indirizzo + "\n";
        }
    }

    preferences.end();

    server.send(200, "text/plain", response);
}

void eliminaBarca()
{
    if (!server.hasArg("id"))
    {
        server.send(400, "text/plain", "Errore: ID mancante!");
        return;
    }

    int id = server.arg("id").toInt();

    preferences.begin("barcheDB", false);
    int count = preferences.getInt("barche_count", 0);

    if (id < 0 || id >= count)
    {
        preferences.end();
        server.send(400, "text/plain", "Errore: ID non valido!");
        return;
    }

    // Shift delle barche per riempire lo spazio dell'elemento eliminato
    for (int i = id; i < count - 1; i++)
    {
        String nextBarca = preferences.getString(("barca_" + String(i + 1)).c_str(), "");
        preferences.putString(("barca_" + String(i)).c_str(), nextBarca);
    }

    // Rimuove l'ultima barca ormai duplicata
    preferences.remove(("barca_" + String(count - 1)).c_str());
    preferences.putInt("barche_count", count - 1);
    preferences.end();

    server.send(200, "text/plain", "Barca eliminata con successo!");
}

void setup()
{
    Serial.begin(115200);

    IoTBoard::init_serial();
    IoTBoard::init_display();
    IoTBoard::init_leds();

    preferences.begin("config", true); // ad esempio con namespace "config"
    String targaGabbiottoString = preferences.getString("targa_gabbiotto");
    preferences.end();

    for (int i = 0; i < 7; i++)
    {
        targa_gabbiotto[i] = targaGabbiottoString[i];
    }

    LoRaMesh::init(targa_gabbiotto, onReceive);
    Serial.println("[LoRaMesh] In ascolto per i messaggi...");

    // Access Point
    WiFi.softAP(apSSID, apPassword);
    display->println("Access Point Attivato");
    display->println("Nome Rete: " + String(apSSID));
    display->println("Password: " + String(apPassword));
    display->display();

    preferences.begin("credenzialiWiFi", false);
    ssid = preferences.getString("ssid", "");
    password = preferences.getString("password", "");
    preferences.end();
    if (ssid != "" && password != "")
    {
        WiFi.begin(ssid, password);
        display->println("Connessione a WiFi...");
        for (int i = 0; i < 10 && WiFi.status() != WL_CONNECTED; i++)
        {
            delay(1000);
            Serial.print(".");
        }
        if (WiFi.status() == WL_CONNECTED)
        {
            display->println("\nConnesso! IP: " + WiFi.localIP().toString());
            display->display();
        }
    }
    else
    {
        display->println("\nCredenziali Wi-Fi mancanti");
        display->display();
    }

    server.on("/", handleRoot);
    server.on("/barca", aggiungiBarca);
    server.on("/barche", getBarche);
    server.on("/eliminaBarca", eliminaBarca);
    server.on("/wifi", aggiungiCredenziali);
    server.begin();
}

void loop()
{
    LoRaMesh::update();

    server.handleClient();
}

void onReceive(LoRaMesh_message_t message)
{
    Serial.println("Destinatario: " + String(message.targa_destinatario));
    Serial.println("Mittente" + String(message.targa_mittente));
    Serial.println("Id messaggio" + String(message.message_id));
    Serial.println("" + String(message.payload.direzione));
    Serial.println("" + String(message.payload.livello_batteria));
    Serial.println("" + String(message.payload.pos_x));
    Serial.println("" + String(message.payload.pos_y));
    Serial.println("" + String(message.payload.stato == st_ormeggio ? "Ormeggiata" : "Rubata"));
}