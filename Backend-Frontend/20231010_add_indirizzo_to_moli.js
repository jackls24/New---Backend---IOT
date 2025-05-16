exports.up = function (knex) {
    return knex.schema.table('moli', function (table) {
        table.string('indirizzo').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('moli', function (table) {
        table.dropColumn('indirizzo');
    });
};
