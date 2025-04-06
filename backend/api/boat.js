const express = require("express");
const router = express.Router();
const knex = require("knex");
const config = require("../../knexfile.js");

// Inizializza knex
const db = knex(config.development);

/**
 * 📌 Recupera tutte le barche (opzionalmente filtrate per molo_id)
 */
router.get("/", async (req, res) => {
    const { molo_id } = req.query;

    try {
        let query = db("boats").select("*");

        if (molo_id) {
            query = query.where({ molo_id });
        }

        const boats = await query;
        res.json(boats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 📌 Recupera una barca specifica per ID
 */
router.get("/:id", async (req, res) => {
    try {
        const boat = await db("boats").where({ id: req.params.id }).first();

        if (!boat) {
            return res.status(404).json({ error: "Barca non trovata" });
        }

        res.json(boat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 📌 Recupera barca da client_id
 */
router.get("/client/:id", async (req, res) => {
    try {
        const boat = await db("boats").where({ id_cliente: req.params.id }).first();

        if (!boat) {
            return res.status(404).json({ error: "Barca non trovata" });
        }

        res.json(boat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 📌 Aggiunge una nuova barca
 */
router.post("/", async (req, res) => {
    // Estrai tutti i campi dal body
    const data = req.body;

    // Verifica che ci siano almeno alcuni dati
    if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: "Nessun dato fornito" });
    }

    // Verifica che i campi obbligatori siano presenti
    const requiredFields = ['targa', 'id_cliente', 'stato'];
    const missingFields = requiredFields.filter(field => !(field in data));

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: `Campi obbligatori mancanti: ${missingFields.join(', ')}`
        });
    }

    try {
        // Inserisci i dati usando Knex
        const [id] = await db("boats").insert(data).returning("id");

        // Crea l'oggetto di risposta con tutti i campi più l'ID
        const response = { id, ...data };
        res.status(201).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * 📌 Aggiorna una barca esistente in modo completamente dinamico
 */
router.put("/:id", async (req, res) => {
    const data = req.body;
    const { id } = req.params;

    // Verifica che ci siano dati da aggiornare
    if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: "Nessun dato fornito per l'aggiornamento" });
    }

    try {
        // Aggiungi timestamp di aggiornamento
        const dataToUpdate = {
            ...data,
            updated_at: db.fn.now()
        };

        // Aggiorna i dati usando Knex
        const updated = await db("boats").where({ id }).update(dataToUpdate);

        if (updated === 0) {
            return res.status(404).json({ error: "Barca non trovata" });
        }

        // Recupera la barca aggiornata
        const boat = await db("boats").where({ id }).first();

        res.json({
            message: "Barca aggiornata!",
            boat
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * 📌 Aggiorna una barca esistente identificandola tramite targa
 */
router.put("/targa/:targa", async (req, res) => {
    const data = req.body;
    const { targa } = req.params;

    // Verifica che ci siano dati da aggiornare
    if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: "Nessun dato fornito per l'aggiornamento" });
    }

    try {
        // Prima verifica se la barca esiste
        const existingBoat = await db("boats").where({ targa }).first();

        if (!existingBoat) {
            return res.status(404).json({ error: "Barca con questa targa non trovata" });
        }

        // Ottieni le colonne della tabella boats
        const tableInfo = await db.raw("PRAGMA table_info(boats)");
        const columnNames = tableInfo.map(col => col.name);

        // Filtra solo i campi che esistono nella tabella
        const filteredData = {};
        let campiScartati = [];

        Object.keys(data).forEach(key => {
            if (columnNames.includes(key)) {
                filteredData[key] = data[key];
            } else {
                campiScartati.push(key);
            }
        });

        // Aggiungi timestamp di aggiornamento
        const dataToUpdate = {
            ...filteredData,
            updated_at: db.fn.now()
        };

        // Aggiorna i dati usando Knex
        await db("boats").where({ targa }).update(dataToUpdate);

        // Recupera la barca aggiornata
        const boat = await db("boats").where({ targa }).first();

        res.json({
            message: "Barca aggiornata con successo!",
            boat,
            campi_ignorati: campiScartati,
            campi_aggiornati: Object.keys(filteredData)
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * 📌 Cancella una barca per ID
 */
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await db("boats").where({ id: req.params.id }).delete();

        if (deleted === 0) {
            return res.status(404).json({ error: "Barca non trovata" });
        }

        res.json({ message: "Barca eliminata!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;