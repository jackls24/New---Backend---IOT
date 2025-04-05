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
//app.use("/locations", locationRouter);



app.get('/', (req, res) => {
    res.json({ message: 'Hello from Node.js backend!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

