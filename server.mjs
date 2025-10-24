import express from 'express';
import fs from 'fs';
import mysql from 'mysql2';


const connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '13578642',
    database: 'pets'
})

// Callback function runs asynchronously.
connection.connect((err)=> {
    if(err){
        console.error("Error connecting to mySQL database: ", err);
        return;
    }
    console.log("Connection to MySQL database was successful. ID is: ", connection.threadId);
})

// connection.query('select * from cats', 
//     // Calls this function when a response is to be received from database.
//     (err, results, fields) => {
//         if(err){
//             console.error("Error when performing the query:", err);
//             return;
//         }
//         console.log('Results of query', results);
// });

const app = express();
const PORT = 5194;
// const entryFile = fs.readFileSync('./src/entry_files/entry.html', 'utf-8');

app.use(express.static('./src/entry_files'))
app.use(express.static('./src/registration_files'))
app.use(express.static('./src/confirmation_files'))

app.get('/', (req, res) => {
    res.send(fs.readFileSync('./src/landingPage.html', 'utf-8'));
})

app.get('/register', (req, res) => {
    res.send(fs.readFileSync('./src/registration_files/register.html', 'utf-8'));
})

app.post('/await_confirm', (req, res) => {
    res.send(fs.readFileSync('./src/confirmation_files/waiting_confirmation.html', 'utf-8'));
})

app.listen(PORT, () => {
    console.log(`Now listening for ByShip traffic at port ${PORT}`)
})