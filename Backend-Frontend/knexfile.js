module.exports = {
    development: {
        client: 'sqlite3',
        connection: {
            filename: './database.db'
            //filename: '/Users/giacomo/Desktop/New - Backend - IOT/backend/database.db'
        },
        useNullAsDefault: true,
        migrations: {
            directory: './migrations'
        }
    }
};
