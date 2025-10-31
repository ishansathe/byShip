
import mysql from 'mysql2';
import { configDotenv } from "dotenv";
configDotenv();

const connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: process.env.db_password,
    database: process.env.db_name
})


connection.query('select reg_key, reg_time from user', 
    (err, result) => {
        if(err){
            console.log(err);
        }
        console.log(result);
    }
)

connection.end((err)=> {
    if(err) {
        console.error(err);
    }
    console.log("Connection closed.")
} )