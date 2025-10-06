import express from 'express';

const app = express();

const PORT = 5194;

app.get('/', (req, res) => {
    res.send("Hello World");
})

app.listen(PORT, () => {
    console.log(`Now listening for ByShip traffic at port ${PORT}`)
})