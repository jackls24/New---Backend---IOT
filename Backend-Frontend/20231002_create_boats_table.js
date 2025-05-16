exports.up = function (knex) {
    return knex.schema.createTable('boats', function (table) {
        table.increments('id').primary();
        table.string('targa').notNullable().unique();
        table.integer('id_cliente').notNullable();
        table.string('stato').notNullable();
        table.integer('molo_id').notNullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.foreign('id_cliente').references('id').inTable('clienti').onDelete('CASCADE');
        table.foreign('molo_id').references('id').inTable('moli').onDelete('CASCADE');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('boats');
};
