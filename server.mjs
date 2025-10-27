import express from 'express';
import fs from 'fs';
import mysql from 'mysql2';
import formidable from 'formidable';
import crypto from 'crypto';
import { SendMailClient } from 'zeptomail';

import { configDotenv } from "dotenv";
configDotenv();

let zepto_mail_url = process.env.zepto_mail_url;
let zepto_token = process.env.zepto_mail_token_api_key;

let client = new SendMailClient({zepto_mail_url, zepto_token})

const connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: process.env.db_password,
    database: process.env.db_name
})

// Callback function runs asynchronously.
connection.connect((err)=> {
    if(err){
        console.error("Error connecting to mySQL database: ", err);
        return;
    }
    console.log("Connection to MySQL database was successful. ID is: ", connection.threadId);
})

// connection.query('select * from user', 
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
    res.send(fs.readFileSync('./src/entry_files/entry.html', 'utf-8'));
})

app.get('/register', (req, res) => {
    res.send(fs.readFileSync('./src/registration_files/register.html', 'utf-8'));
})

app.post('/await_confirm', (req, res) => {
    console.log(req.body)
    formidable().parse(req, (err, fields, files) => {
        if (err) {
            console.log(err);
        }
        console.log(fields, files);

        console.log(fields.name[0]);
        
        // Stored it here because I will need it again later.
        let reg_key = crypto.randomBytes(24).toString('hex');

        connection.query(
            "insert into user (name, email, number, password, user_type, confirmed, reg_key, reg_time) values" +
                "('" +fields.name[0] + "', '"+
                fields.email[0]+ "', '"+
                fields.contact[0]+ "', '"+
                fields.password[0]+ "', '"+
                fields.user_type[0]+ "', "+
                "0"+ ", '" +//By default, user is not confirmed till he confirms registration.
                reg_key + "', '" +
                Date.now() + "'" + // Date in UNIX timestamp.
                ")"
            , //query ends above and callback handler functions begin below.
            (err, result) =>{
                if(err) {
                    console.error(err);
                    return;
                }
                console.log("Results of query: ", result)
            }
        );

        res.send(fs.readFileSync('./src/confirmation_files/waiting_confirmation.html', 'utf-8'));
    })
})

app.listen(PORT, () => {
    console.log(`Now listening for ByShip traffic at port ${PORT}`)
})