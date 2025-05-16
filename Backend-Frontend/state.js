const express = require("express");
const router = express.Router();
const knex = require("knex");
const config = require("../../knexfile.js");

const db = knex(config.development);


// Ottieni barche con stato appena cambiato
router.get("/", async (req, res) => {
    try {

        await db.transaction(async (trx) => {
            const stolenBoats = await trx("boats")
                .select("id", "targa", "stato", "key")
                .where("fresh", true)
                .whereNot("stato", "rubato")
                .whereNot("stato", "rubata");



            if (stolenBoats.length > 0) {
                const boatIds = stolenBoats.map(boat => boat.id);

                await trx("boats")
                    .whereIn("id", boatIds)
                    .update({
                        fresh: false,
                        updated_at: trx.fn.now()
                    });

                console.log(`Reset stato fresh per ${boatIds.length} barche`);
            }

            const boatsWithoutIds = stolenBoats.map(boat => {
                const { id, ...boatWithoutId } = boat;
                return boatWithoutId;
            });


            res.json(boatsWithoutIds);
        });
    } catch (error) {
        console.error("Errore nella transazione:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;