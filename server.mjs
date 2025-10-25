import express from 'express';
import fs from 'fs';

const app = express();
const PORT = 5194;
// const entryFile = fs.readFileSync('./src/entry_files/entry.html', 'utf-8');

app.use(express.static('./public'))

app.get('/', (req, res) => {
    // The name was landingPage, but got changed to 'index' for vercel issues.
    // res.json({ message: 'Hello from Express on Vercel!' });
    res.send(fs.readFileSync('./public/index.html', 'utf-8'));
})

app.listen(PORT, () => {
    console.log(`Now listening for ByShip traffic at port ${PORT}`)
})

export default app;

let dirArray = (fs.readdirSync('./'));

let newJsonArray = [];
for (let index in dirArray) {
    let object = {
        item: dirArray[index]
    }
    newJsonArray.push(object)
}

console.log(JSON.stringify(newJsonArray))

