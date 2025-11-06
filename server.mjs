import express from 'express';
import fs from 'fs';
import mysql from 'mysql2';
import formidable from 'formidable';
import {randomBytes, createHash} from 'crypto';
import nodemailer from 'nodemailer';
import cookieparser from 'cookie-parser';


import { configDotenv } from "dotenv";
configDotenv();


let hash = createHash('sha256');

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



const app = express();
const PORT = 5194;
// const entryFile = fs.readFileSync('./src/entry_files/entry.html', 'utf-8');

app.use(cookieparser());

app.use(express.static('./src/entry_files'))
app.use(express.static('./src/registration_files'))
app.use(express.static('./src/confirmation_files'))
app.use(express.static('./src/login_files'))

app.set('view engine', 'ejs')
app.set('views', './src/login_files')

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
        // Stored it here because I will need it again later.
        // Taken from the crypto library!
        let reg_key = randomBytes(24).toString('hex');
        
        connection.query("insert into user_acc (email, password, user_type) values" +
            "('" + fields.email[0] + "', '" +
            fields.password[0] + "', '" +
            fields.user_type[0] + "');"
            , (err, result, _) => {
                if(err) {
                    console.log(err);
                    return;
                }

                connection.query("insert into user_details (username, name, number, user_id) values" +
                    "('" + fields.username[0] + "', '" +
                    fields.fullname[0] + "', " +
                    fields.contact[0] + ", "+ result.insertId + ");",
                    (err, r, f) => {
                        if(err){
                            console.log(err);
                            return;
                        }
                    }
                )
                connection.query("insert into user_reg (email, reg_key, link_sent_time, user_id) values " +
                    "( '" + fields.email[0] + "', '" +
                    reg_key + "', " +
                    Date.now() + ", " + result.insertId + ");",
                    (err, r, f) => {
                        if(err) {
                            console.log(err);
                            return;
                        }
                    }
                )
            }
        )

        let mailOptions = {
            from: '"Byship Team" <byship-team@byship.in>',
            to: `${fields.email[0]}`,
            subject: "Please confirm your registration.",
            // html: "Your registration URL is: <br>",
            text: `http://localhost:5194/confirmation?reg_key=${reg_key}

            After registration is confirmed, you will be redirected to the login page, where you have to login again.
            
            Note, this link expires after two hours. If expired, go to link anyway to retrieve a new registration confirmation link.`
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

        res.cookie('email', fields.email[0]);
        res.send(fs.readFileSync('./src/confirmation_files/waiting_confirmation.html', 'utf-8'));
    })
})

app.get('/confirmation', (req,res) => {
    let reg_key = req.query.reg_key
    
    let reg_success = false;
    console.log(url_key);
    // connection.query('select reg_key, reg_time from user', 
    //     (err, result) => {
    //         if(err){
    //             console.log(err);
    //         }
        
    //         for (let i in result) {

    //             if (result[i].reg_key == url_key) {
    //                 console.log("Good stuff.")

    //                 // If you have register within the timelimit. You are good to go!
    //                 // 7200 = 2 hours (in seconds) = 7200000 (in milliseconds)
    //                 if(result[i].reg_time > ( Date.now() - 7200000)) {
    //                     console.log("Link is valid! Registration complete!");

    //                     // I don't think a callback is needed for this one.
    //                     connection.query(`update user set confirmed = 1 where reg_key = '${url_key}'`)
    //                     res.redirect('/login');
    //                 }
    //                 // If you have registered too long ago, where timestamp is now lesser than two hour limit allows
    //                 // You have to re-register.
    //                 else {
    //                     console.log("Link has now expired. You need to re-register.");
    //                     res.redirect('/await_confirm?expired=true')
    //                 }
    //                 return;
    //             }
    //         }
    //     }
    // )

    connection.query(`select user_id, email, link_sent_time from user_reg where reg_key = ${reg_key}`, 
        (err, result, fields) => {
            if(err) {
                console.log(err);
            }

            if(result.length == 0){
                return;
            }

            if(result[0].link_sent_time + 7200000 > Date.now()) {
                connection.query(`update user_acc set confirmed = 1 where user_id = ${result[0].user_id}`);
            }
            else {
                let new_reg_key = randomBytes(24).toString('hex');
                connection.query(`update user_reg set reg_key = '${new_reg_key}', ` + 
                    `link_sent_time =` + Date.now() + `where user_id = ${result[0].user_id};`);
                
                let mailOptions = {
                    from: '"Byship Team" <byship-team@byship.in>',
                    to: `${result[0].email}`,
                    subject: "Please confirm your registration.",
                    // html: "Your registration URL is: <br>",
                    text: `http://localhost:5194/confirmation?reg_key=${new_reg_key}

                    After registration is confirmed, you will be redirected to the login page, where you have to login again.
                    
                    Note, this link expires after two hours. If expired, go to link anyway to retrieve a new registration confirmation link.`
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
            }
        }
    )
})

// This is for post request when function comes from login page.
app.post('/home', (req, res) => {
    console.log(req.cookies);

    formidable().parse(req, (err, fields, files) => {
        if(err) {
            console.log(err);
        }
        console.log(fields.email[0])

        let emailId = fields.email[0];
        let password = fields.password[0];
        let user_type = fields.acc_type[0];

        connection.query(`select confirmed from user where email = "${emailId}" and password = "${password}" and user_type = "${user_type}"`,
            (err, result) => {
                if(err) {
                    console.log(err);

                    // Malicious input.
                    if(err.code == "ER_PARSE_ERROR"){
                        res.redirect('/login?code=3')
                        return;
                    }
                }

                /* Result always comes in the form of array of objects */

                // User does not exist
                    // The choice of this condition is due to behaviour of javascript.
                    // It sees result as an object which actually contains an array of objects.
                    // So that's why it's not possible to directly check if its an empty array, because its an object.
                    // But it's possible to check its length.
                if(result.length == 0 ){
                    res.redirect('/login?code=1')
                    console.log("works")

                    return;
                }
                
                // User exists.
                if(result[0].confirmed == 1) {

                    let hash = createHash('sha256');
                    hash.update(password);
                    hash.update(Math.random().toString());
                    res.cookie('sess_id', hash.digest(), {
                        path: '/home'
                    })
                    res.send(fs.readFileSync('./src/sample.html','utf-8'))
                    return;
                }

                // registration not confirmed
                if(result[0].confirmed == 0) {
                    res.redirect('/login?code=2')
                    return;
                }
            }
        )
    })
})

app.get('/home', (req, res) => {
    console.log(req.cookies);
    res.send(fs.readFileSync('./src/sample.html','utf-8'));
})


app.get('/login', (req, res) => {
    console.log(req.query)
    if(req.query.code == '1') {
        res.render('login', {existence_error : "Invalid Username, Password, User Type or all."})
        return;
    }

    if(req.query.code == '2') {
        res.render('login', {existence_error : "Registration not confirmed."})
        return;
    }

    if(req.query.code == '3') {
        res.render('login', {existence_error : "Malicious input received."})
        return;
    }

    res.render('login', {
        existence_error: ""
    })
})

app.get('/home/:user', (req, res) => {
    console.log(req.params);
    res.send(fs.readFileSync('./src/sample.html','utf-8'));
})

app.listen(PORT, () => {
    console.log(`Now listening for ByShip traffic at port ${PORT}`)
})