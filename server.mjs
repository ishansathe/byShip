import express from 'express';
import fs from 'fs';

const app = express();
const PORT = 5194;

console.log(fs.readdirSync("/"));

// const entryFile = fs.readFileSync('./src/entry_files/entry.html', 'utf-8');

// app.use(express.static('./public'))

app.get('/', (req, res) => {
    // The name was landingPage, but got changed to 'index' for vercel issues.
    res.send(fs.readFileSync('/index.html', 'utf-8'));
})

// app.listen(PORT, () => {
//     console.log(`Now listening for ByShip traffic at port ${PORT}`)
// })

export default app;