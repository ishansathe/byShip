import express from 'express';
import fs from 'fs'


const app = express();
const PORT = 5194;
// const entryFile = fs.readFileSync('./src/entry_files/entry.html', 'utf-8');

app.use(express.static('./src/entry_files'))
app.use(express.static('./src/registration_files'))

app.get('/', (req, res) => {
    res.send(fs.readFileSync('./src/entry_files/entry.html', 'utf-8'));
})

app.listen(PORT, () => {
    console.log(`Now listening for ByShip traffic at port ${PORT}`)
})