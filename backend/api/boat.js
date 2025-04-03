const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * 📌 Recupera tutte le barche (opzionalmente filtrate per molo_id)
 */
router.get("/", (req, res) => {
    const { molo_id } = req.query;
    let query = "SELECT * FROM boats";
    const params = [];
    if (molo_id) {
        query += " WHERE molo_id = ?";
        params.push(molo_id);
    }
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

/**
 * 📌 Recupera una barca specifica per ID
 */
router.get("/:id", (req, res) => {
    db.get("SELECT * FROM boats WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Barca non trovata" });
        }
        res.json(row);
    });
});

// Recupera barca da client_id
router.get("/client/:id", (req, res) => {
    db.get("SELECT * FROM boats WHERE id_cliente = ?", [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Barca non trovata" });
        }
        res.json(row);
    });
});






/**
 * 📌 Aggiunge una nuova barca
 */
router.post("/", (req, res) => {
    const { targa, id_cliente, stato, molo_id } = req.body;
    const query = "INSERT INTO boats (targa, id_cliente, stato, molo_id) VALUES (?, ?, ?, ?)";
    db.run(query, [targa, id_cliente, stato, molo_id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID, targa, id_cliente, stato, molo_id });
    });
});

/**
 * 📌 Aggiorna una barca esistente
 */
router.put("/:id", (req, res) => {
    const { targa, id_cliente, stato, molo_id } = req.body;
    const query = `
    UPDATE boats 
    SET targa = ?, id_cliente = ?, stato = ?, molo_id = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?`;
    db.run(query, [targa, id_cliente, stato, molo_id, req.params.id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Barca non trovata" });
        }
        res.json({ message: "Barca aggiornata!" });
    });
});

/**
 * 📌 Cancella una barca per ID
 */
router.delete("/:id", (req, res) => {
    db.run("DELETE FROM boats WHERE id = ?", [req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Barca non trovata" });
        }
        res.json({ message: "Barca eliminata!" });
    });
});

module.exports = router;




