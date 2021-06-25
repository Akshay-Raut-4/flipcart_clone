import express from 'express';
import dotenv from 'dotenv';

//component
import Connection from './dataBase/db.js'
import DefaultData from './default.js'

dotenv.config();

const  app = express();

const PORT=process.env.PORT;

const userName =process.env.DB_USERNAME;
const password =process.env.DB_PASSWORD;

Connection(userName,password)
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})


//default data to database
DefaultData()