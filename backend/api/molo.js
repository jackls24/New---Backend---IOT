const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /moli - Recupera tutti i moli
router.get("/", (req, res) => {
    // Query per ottenere moli con calcolo dei posti disponibili
    const query = `
        SELECT m.*,
               m.capacita - COALESCE(m.posti_occupati, 0) AS posti_disponibili
        FROM moli m
    `;

    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET /moli/:id - Recupera un molo specifico per ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT m.*,
               m.capacita - COALESCE(m.posti_occupati, 0) AS posti_disponibili
        FROM moli m
        WHERE m.id = ?
    `;

    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Molo non trovato" });
        }
        res.json(row);
    });
});

// POST /moli - Crea un nuovo molo
router.post("/", (req, res) => {
    // Estrae tutti i campi necessari
    const { nome, provincia, capacita, posti_occupati = 0, indirizzo } = req.body;
    const sql = "INSERT INTO moli (nome, provincia, capacita, posti_occupati, indirizzo) VALUES (?, ?, ?, ?, ?)";
    db.run(sql, [nome, provincia, capacita, posti_occupati, indirizzo], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        const capacitaInt = parseInt(capacita) || 0;
        const postiOccupatiInt = parseInt(posti_occupati) || 0;

        res.status(201).json({
            id: this.lastID,
            nome,
            provincia,
            capacita: capacitaInt,
            posti_occupati: postiOccupatiInt,
            indirizzo,
            posti_disponibili: capacitaInt - postiOccupatiInt
        });
    });
});

// PUT /moli/:id - Aggiorna un molo
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { nome, provincia, capacita, posti_occupati, indirizzo } = req.body;

    // Assicuriamoci che i valori numerici siano numeri
    const capacitaInt = parseInt(capacita) || 0;
    const postiOccupatiInt = parseInt(posti_occupati) || 0;

    const sql = "UPDATE moli SET nome = ?, provincia = ?, capacita = ?, posti_occupati = ?, indirizzo = ? WHERE id = ?";
    db.run(sql, [nome, provincia, capacitaInt, postiOccupatiInt, indirizzo, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Molo non trovato" });
        }
        res.json({
            id: parseInt(id),
            nome,
            provincia,
            capacita: capacitaInt,
            posti_occupati: postiOccupatiInt,
            indirizzo,
            posti_disponibili: capacitaInt - postiOccupatiInt
        });
    });
});

// DELETE /moli/:id - Elimina un molo
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM moli WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Molo non trovato" });
        }
        res.json({ message: "Molo eliminato" });
    });
});

module.exports = router;
