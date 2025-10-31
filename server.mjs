import express from 'express';
import fs from 'fs';
import mysql from 'mysql2';
import formidable from 'formidable';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import cookieparser from 'cookie-parser';


import { configDotenv } from "dotenv";
configDotenv();

let zepto_mail_url = process.env.zepto_mail_url;
let zepto_token = process.env.zepto_mail_token_api_key;

let transport = nodemailer.createTransport({
    host: "smtp.zeptomail.in",
    port: 587,
    auth: {
        user: process.env.zepto_smtp_username,
        pass: process.env.zepto_smtp_password
    }
})



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

app.use(cookieparser());

app.use(express.static('./src/entry_files'))
app.use(express.static('./src/registration_files'))
app.use(express.static('./src/confirmation_files'))
app.use(express.static('./src/login_files'))

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

        let mailOptions = {
            from: '"Byship Team" <byship-team@byship.in>',
            to: `${fields.email[0]}`,
            subject: "Please confirm your registration.",
            // html: "Your registration URL is: <br>",
            text: `http://localhost:5194/confirmation?reg_key=${reg_key}
            
            Note, this link expires after two hours, after which you will have to log in again.`
        }

        transport.sendMail(mailOptions, (err, infor) => {
            if(err){
                return console.error(err);
            }
            else 
            {
                console.log("Email Sent successfully.");
                console.log("Here is info: ", infor);
            }
        })

        res.send(fs.readFileSync('./src/confirmation_files/waiting_confirmation.html', 'utf-8'));
    })
})

app.get('/confirmation', (req,res) => {
    let url_key = req.query.reg_key
    
    let reg_success = false;
    console.log(url_key);
    connection.query('select reg_key, reg_time from user', 
        (err, result) => {
            if(err){
                console.log(err);
            }
        
            for (let i in result) {

                if (result[i].reg_key == url_key) {
                    console.log("Good stuff.")

                    // If you have register within the timelimit. You are good to go!
                    // 7200 = 2 hours (in seconds) = 7200000 (in milliseconds)
                    if(result[i].reg_time > ( Date.now() - 7200000)) {
                        console.log("Link is valid! Registration complete!");

                        // I don't think a callback is needed for this one.
                        connection.query(`update user set confirmed = 1 where reg_key = '${url_key}'`)
                        res.cookie("ssid", "1234", {
                            path: '/home',
                            expires: new Date(Date.now() + 7200000),
                        })
                        res.redirect('/home');
                    }
                    // If you have registered too long ago, where timestamp is now lesser than two hour limit allows
                    // You have to re-register.
                    else {
                        console.log("Link has now expired. You need to re-register.");
                        res.redirect('/register')
                    }
                    return;
                }
            }
        }
    )
})

app.get('/home', (req, res) => {
    console.log(req.cookies);
    res.send(fs.readFileSync('./src/sample.html','utf-8'))
})

app.get('/login', (req, res) => {
    res.send(fs.readFileSync('./src/login_files/login.html', 'utf-8'))
})

app.listen(PORT, () => {
    console.log(`Now listening for ByShip traffic at port ${PORT}`)
})