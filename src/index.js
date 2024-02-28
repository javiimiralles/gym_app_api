import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { dbConnection } from './database/config.js';
import 'dotenv/config';

import authRouter from './routes/auth.routes.js';
import userRouter from './routes/users.routes.js';

const app = express();
dbConnection();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// API Routes
app.use('/api/login', authRouter);
app.use('/api/users', userRouter);

app.listen(process.env.PORT, ()=>{
    console.log('Server running on port ' + process.env.PORT);
});
