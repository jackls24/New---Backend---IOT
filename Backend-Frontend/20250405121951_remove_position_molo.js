/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table('moli', function (table) {
        table.dropColumn('latitude');
        table.dropColumn('longitude');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('moli', function (table) {
        table.float('latitude').nullable();
        table.float('longitude').nullable();
    });
};