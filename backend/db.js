const sqlite3 = require("sqlite3").verbose();

// Creazione del database (se non esiste, lo crea automaticamente)
const db = new sqlite3.Database("database.db", (err) => {
    if (err) {
        console.error("Errore nella connessione al database:", err.message);
    } else {
        console.log("Database SQLite connesso!");
    }
});




/*

// Eliminare la tabella boats se esiste e ricrearla con la colonna molo_id
db.run(`DROP TABLE IF EXISTS boats`, (dropErr) => {
    if (dropErr) {
        console.error("Errore nel drop della tabella boats:", dropErr.message);
    } else {
        console.log("Tabella boats eliminata!");
        db.run(`
          CREATE TABLE boats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            targa TEXT NOT NULL UNIQUE,
            id_cliente INTEGER NOT NULL,
            stato TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_cliente) REFERENCES clienti(id) ON DELETE CASCADE,
            FOREIGN KEY (molo_id) REFERENCES moli(id) ON DELETE CASCADE
          )
        `, (createErr) => {
            if (createErr) {
                console.error("Errore nella creazione della tabella boats:", createErr.message);
            } else {
                console.log("Tabella boats creata correttamente!");
            }
        });
    }
});
*/

module.exports = db;
