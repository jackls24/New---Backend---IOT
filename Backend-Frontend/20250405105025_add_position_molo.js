/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table('moli', function (table) {
        table.float('latitudine').nullable();
        table.float('longitudine').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('moli', function (table) {
        table.dropColumn('latitudine');
        table.dropColumn('longitudine');
    });
};