/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('locations', (table) => {
        // Chiave primaria auto-incrementale
        table.increments('id').primary();

        // Coordinate di posizione
        table.float('x').notNullable().comment('Coordinata X della posizione');
        table.float('y').notNullable().comment('Coordinata Y della posizione');

        // Timestamp della rilevazione
        table.integer('timestamp').notNullable().comment('Timestamp Unix della rilevazione');

        // Riferimento alla barca
        table.integer('boat_id').unsigned().notNullable();
        table.foreign('boat_id').references('id').inTable('boats').onDelete('CASCADE');

        // Timestamp di sistema
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at').nullable();

        // Indici per migliorare le performance
        table.index(['boat_id', 'timestamp'], 'idx_location_boat_timestamp');
        table.index(['x', 'y'], 'idx_location_coordinates');
        table.index('deleted_at', 'idx_location_deleted');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('locations');
};