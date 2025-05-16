/**
 * Migrazione per rimuovere il campo posti_disponibili dalla tabella moli.
 * Useremo solo capacita e posti_occupati, calcolando i posti disponibili come differenza tra i due.
 */
exports.up = function (knex) {
    return knex.schema.table('moli', function (table) {
        // Rimuoviamo il campo posti_disponibili
        table.dropColumn('posti_disponibili');
    });
};

exports.down = function (knex) {
    return knex.schema.table('moli', function (table) {
        // Se dovessimo ripristinare, riaggiungiamo posti_disponibili
        table.integer('posti_disponibili').notNullable().defaultTo(0);
    });
};
