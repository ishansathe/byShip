
import mysql from 'mysql2';
import { configDotenv } from "dotenv";
configDotenv();

const connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: process.env.db_password,
    database: process.env.db_name
})


connection.query('select confirmed from user where email="ishansatheprofessional@gmail.com" and password="sasdasfsad" OR 1=1";', 
    (err, result) => {
        if(err){
            console.log(err.code);
        }
        // if(result == []){

        // }
        console.log(result)
    }
)

connection.end((err)=> {
    if(err) {
        console.error(err);
    }
    console.log("Connection closed.")
} )