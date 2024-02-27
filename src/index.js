import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { dbConnection } from './database/config.js';
import 'dotenv/config';

const app = express();
dbConnection();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// API Routes


app.listen(process.env.PORT, ()=>{
    console.log('Server running on port ' + process.env.PORT);
});
