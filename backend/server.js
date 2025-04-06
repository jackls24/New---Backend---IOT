require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRouter = require("./api/user");
const boatRouter = require("./api/boat");
const moloRouter = require("./api/molo");
const locationRouter = require("./api/location");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());


// Monta le API utenti su "/users"
app.use("/users", userRouter);
app.use("/boats", boatRouter);
app.use("/molo", moloRouter);
app.use("/locations", locationRouter);



app.get('/', (req, res) => {
    res.json({ message: 'Hello from Node.js backend!' });
});
/*
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
*/

const os = require('os');

// Trova l'interfaccia di rete da usare per la rete locale
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Prendi solo IPv4 e non l'indirizzo di loopback
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
}

const localIP = getLocalIP();

app.listen(5001, '0.0.0.0', () => {
    console.log(`Server avviato sulla porta 5001`);
    console.log(`Accesso locale: http://localhost:5001`);
    console.log(`Accesso rete locale: http://${localIP}:5001`);
});
