exports.up = function (knex) {
    return knex.schema.createTable('moli', function (table) {
        table.increments('id').primary();
        table.string('nome').notNullable().unique();
        table.string('provincia').notNullable();
        table.integer('capacita').notNullable();
        table.string("stato");
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('moli');
};