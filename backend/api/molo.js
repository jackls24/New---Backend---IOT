const express = require("express");
const router = express.Router();
const knex = require("knex");
const config = require("../../knexfile.js");

// Inizializza knex
const db = knex(config.development);

// GET /moli - Recupera tutti i moli
router.get("/", async (req, res) => {
    try {
        const moli = await db("moli")
            .select("*")
            .select(db.raw("capacita - COALESCE(posti_occupati, 0) as posti_disponibili"));

        res.json(moli);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /moli/:id - Recupera un molo specifico per ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const molo = await db("moli")
            .select("*")
            .select(db.raw("capacita - COALESCE(posti_occupati, 0) as posti_disponibili"))
            .where({ id })
            .first();

        if (!molo) {
            return res.status(404).json({ error: "Molo non trovato" });
        }

        res.json(molo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /moli - Crea un nuovo molo dinamicamente
router.post("/", async (req, res) => {
    const data = req.body;

    try {
        // Gestione dei tipi di dati
        const processedData = processDataTypes(data);

        // Inserisci il molo
        const [id] = await db("moli").insert(processedData).returning("id");

        // Preparazione della risposta
        let result = {
            id,
            ...processedData
        };

        // Calcola posti_disponibili se possibile
        if ('capacita' in processedData && 'posti_occupati' in processedData) {
            result.posti_disponibili = processedData.capacita - processedData.posti_occupati;
        }

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /moli/:id - Aggiorna un molo dinamicamente
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Se non ci sono dati da aggiornare
    if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: "Nessun dato fornito per l'aggiornamento" });
    }

    try {
        // Gestione dei tipi di dati
        const processedData = processDataTypes(data);

        // Aggiorna il molo
        const updated = await db("moli").where({ id }).update(processedData);

        if (!updated) {
            return res.status(404).json({ error: "Molo non trovato" });
        }

        // Recupera il molo aggiornato
        const molo = await db("moli")
            .select("*")
            .select(db.raw("capacita - COALESCE(posti_occupati, 0) as posti_disponibili"))
            .where({ id })
            .first();

        res.json(molo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /moli/:id - Elimina un molo
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await db("moli").where({ id }).delete();

        if (!deleted) {
            return res.status(404).json({ error: "Molo non trovato" });
        }

        res.json({ message: "Molo eliminato" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Funzione per la gestione automatica dei tipi di dati
function processDataTypes(data) {
    const result = {};

    for (const [key, value] of Object.entries(data)) {
        if (['capacita', 'posti_occupati'].includes(key)) {
            result[key] = parseInt(value) || 0;
        } else if (['latitudine', 'longitudine'].includes(key)) {
            result[key] = value === '' ? null : parseFloat(value);
        } else {
            result[key] = value;
        }
    }

    return result;
}

module.exports = router;