const express = require("express");
const router = express.Router();
const knex = require("knex");
const config = require("../../knexfile.js");

// Inizializza knex
const db = knex(config.development);



router.get('/', async (req, res) => {
    try {
        const locations = await db('locations')
            .whereNull('deleted_at')
            .orderBy('timestamp', 'desc');

        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.get('/boat/:boatId', async (req, res) => {
    try {
        const { boatId } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        // Verifica che la barca esista
        const boat = await db('boats').where({ id: boatId }).first();
        if (!boat) {
            return res.status(404).json({ error: 'Barca non trovata' });
        }

        const locations = await db('locations')
            .where({ boat_id: boatId })
            .whereNull('deleted_at')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .offset(offset);

        // Conteggio totale per paginazione
        const [{ count }] = await db('locations')
            .where({ boat_id: boatId })
            .whereNull('deleted_at')
            .count('* as count');

        res.json({
            data: locations,
            total: count,
            limit,
            offset
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * @api {post} /locations/targa/:targa Crea una nuova posizione usando la targa della barca
 * @apiName CreateLocationByBoatPlate
 * @apiGroup Location
 * @apiParam {String} targa Targa della barca
 * @apiBody {Number} x Coordinata X della posizione
 * @apiBody {Number} y Coordinata Y della posizione
 * @apiBody {Number} timestamp Timestamp Unix della rilevazione
 */
router.post('/targa/:targa', async (req, res) => {
    try {
        const { targa } = req.params;
        const { x, y, timestamp } = req.body;

        // Validazione campi obbligatori
        if (x === undefined || y === undefined || timestamp === undefined) {
            return res.status(400).json({
                error: 'Campi obbligatori mancanti',
                requiredFields: ['x', 'y', 'timestamp']
            });
        }

        // Cerca la barca tramite targa
        const boat = await db('boats').where({ targa }).first();
        if (!boat) {
            return res.status(404).json({ error: 'Barca con questa targa non trovata' });
        }

        // Ottieni l'ID della barca
        const boat_id = boat.id;

        // Inserisci la posizione
        const [id] = await db('locations').insert({
            x,
            y,
            timestamp,
            boat_id
        }).returning('id');

        // Recupera la posizione appena creata
        const location = await db('locations').where({ id }).first();


        res.status(201).json({
            message: 'Posizione aggiunta con successo',
            barca: {
                targa: boat.targa,
                id: boat.id,
                nome: boat.nome
            },
            location
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @api {get} /locations/targa/:targa/latest Ottieni l'ultima posizione di una barca tramite targa
 * @apiName GetLatestBoatLocationByPlate
 * @apiGroup Location
 * @apiParam {String} targa Targa della barca
 */
router.get('/targa/:targa/latest', async (req, res) => {
    try {
        const { targa } = req.params;

        // Cerca la barca tramite targa
        const boat = await db('boats').where({ targa }).first();
        if (!boat) {
            return res.status(404).json({ error: 'Barca con questa targa non trovata' });
        }

        // Ottieni l'ultima posizione per timestamp
        const location = await db('locations')
            .where({ boat_id: boat.id })
            .whereNull('deleted_at')
            .orderBy('timestamp', 'desc')
            .first();

        if (!location) {
            return res.status(404).json({ error: 'Nessuna posizione trovata per questa barca' });
        }

        res.json({
            barca: {
                targa: boat.targa,
                id: boat.id,
                nome: boat.nome
            },
            location
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @api {get} /locations/targa/:targa/all Ottieni tutte le posizioni di una barca tramite targa
 * @apiName GetBoatLocationsByPlate
 * @apiGroup Location
 * @apiParam {String} targa Targa della barca
 * @apiQuery {Number} [limit=100] Numero massimo di posizioni da restituire
 * @apiQuery {Number} [offset=0] Offset per la paginazione
 */
router.get('/targa/:targa/all', async (req, res) => {
    try {
        const { targa } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        // Cerca la barca tramite targa
        const boat = await db('boats').where({ targa }).first();
        if (!boat) {
            return res.status(404).json({ error: 'Barca con questa targa non trovata' });
        }

        const locations = await db('locations')
            .where({ boat_id: boat.id })
            .whereNull('deleted_at')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .offset(offset);

        // Conteggio totale per paginazione
        const [{ count }] = await db('locations')
            .where({ boat_id: boat.id })
            .whereNull('deleted_at')
            .count('* as count');

        res.json({
            barca: {
                targa: boat.targa,
                id: boat.id,
                nome: boat.nome
            },
            data: locations,
            total: count,
            limit,
            offset
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;