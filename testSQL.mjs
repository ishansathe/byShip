
import mysql from 'mysql2';
import { configDotenv } from "dotenv";
configDotenv();

const connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: process.env.db_password,
    database: process.env.db_name
})


connection.query('select confirmed from user where email="ishansatheprofessional@gmail.com" and password="sasdasfsad";', 
    (err, result) => {
        if(err){
            console.log(err.code);
        }
        // if(result == []){

        // }
        console.log(result)
    }
)

// connection.query("insert into user_acc (email, password, user_type) values" +
//             "('ishan', 'sdafas', 'seller')"
//         , (err, result, fields) => {
//             if(err) {
//                 console.log(err);
//                 return;
//             }
//             console.log(result);

//             connection.query("insert into user_details (username, name, number, user_id) values" +
//                 "('ishan', 'Ishan Sathe', 8547315860," + result.insertId + ")",
//                 (err1, result1, fields1) => {
//                     if(err1) {
//                         console.error(err1);
//                         return;
//                     }
//                     console.log(result1)
//                     console.log(fields1)

                    
//                 }
//             )
//             console.log(fields);
//         })

connection.query("select user_id, link_sent_time from user_reg where reg_key = 'aaebcdc98cc7699b1b74b2c3a48a3b1399c8b8d9ec78fd40'", 
    (err, result, fields) => {
        console.log(result, fields)
        console.log(result[0].link_sent_time);

        if(result[0].link_sent_time + 7200000 > Date.now()){
            console.log("Link is valid");
        }
    }
)
connection.end((err)=> {
    if(err) {
        console.error(err);
    }
    console.log("Connection closed.")
} )