const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /users - Elenco utenti
router.get("/", (req, res) => {
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ users: rows });
    });
});

// GET /users/:id - Dettagli utente
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Utente non trovato" });
        }
        res.json({ user: row });
    });
});

// POST /users - Crea un nuovo utente
router.post("/", (req, res) => {
    const { name, email } = req.body;
    const sql = "INSERT INTO users (name, email) VALUES (?, ?)";
    db.run(sql, [name, email], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name, email });
    });
});

// PUT /users/:id - Aggiorna un utente
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
    db.run(sql, [name, email, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Utente non trovato" });
        }
        res.json({ id, name, email });
    });
});

// DELETE /users/:id - Elimina un utente
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Utente non trovato" });
        }
        res.json({ message: "Utente eliminato" });
    });
});

module.exports = router;