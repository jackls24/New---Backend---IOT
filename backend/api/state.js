const express = require("express");
const router = express.Router();
const knex = require("knex");
const config = require("../../knexfile.js");

// Inizializza knex
const db = knex(config.development);



// Ottieni barche con stato "rubato"
router.get("/", async (req, res) => {
    try {
        const stolenBoats = await db("boats").select("targa", "stato").where({ stato: "ormeggiata" });
        res.json(stolenBoats);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;