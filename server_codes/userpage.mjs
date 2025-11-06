import express from 'express';

const app = express(); 

let userPage = (req, res) => {
    
}

app.get('/home/:user', (req, res) => {
    req.params.user 
})