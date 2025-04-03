/**
 * Migrazione per aggiungere il campo posti_occupati alla tabella moli.
 * Questo campo verrà usato per tenere traccia del numero di barche attualmente ormeggiate,
 * in alternativa al calcolo dinamico tramite JOIN con la tabella boats.
 */
exports.up = function (knex) {
    return knex.schema.table('moli', function (table) {
        // Aggiungiamo il campo posti_occupati con default 0
        table.integer('posti_occupati').notNullable().defaultTo(0);

        // Rinominiamo il campo capacita in posti_disponibili per maggiore chiarezza
        // Se il DB supporta ALTER TABLE ... RENAME COLUMN
        if (knex.client.config.client !== 'sqlite3') {
            table.renameColumn('capacita', 'posti_disponibili');
        }
        // Per SQLite che non supporta direttamente RENAME COLUMN
        // lasciamo entrambi i campi e aggiungiamo posti_disponibili
        else {
            table.integer('posti_disponibili').notNullable().defaultTo(0);
        }
    });
};

exports.down = function (knex) {
    return knex.schema.table('moli', function (table) {
        // Rimuoviamo posti_occupati
        table.dropColumn('posti_occupati');

        // Se il DB supporta RENAME COLUMN, riportiamo posti_disponibili a capacita
        if (knex.client.config.client !== 'sqlite3') {
            table.renameColumn('posti_disponibili', 'capacita');
        }
        // Per SQLite, rimuoviamo solo posti_disponibili (capacita è sempre rimasto)
        else {
            table.dropColumn('posti_disponibili');
        }
    });
};
