/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table('boats', table => {
        // Aggiunta del campo nome
        table.string('nome').nullable();
        // Aggiunta dei campi geografici come float
        table.float('longitudine').nullable();
        table.float('latitudine').nullable();
        // Aggiunta del campo timestamp per l'ultimo rilevamento
        table.timestamp('ultima_rilevazione').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('boats', table => {
        // Rimozione dei campi in caso di rollback
        table.dropColumn('nome');
        table.dropColumn('longitudine');
        table.dropColumn('latitudine');
        table.dropColumn('ultima_rilevazione');
    });
};