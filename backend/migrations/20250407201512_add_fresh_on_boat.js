/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table('boats', function (table) {

        table.boolean('fresh').notNullable().defaultTo(false)
            .comment('Indica se la barca è stata appena aggiornata');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('boats', function (table) {
        table.dropColumn('fresh');
    });
};
