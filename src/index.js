import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { dbConnection } from './database/config.js';
import 'dotenv/config';

import authRouter from './routes/auth.routes.js';
import usersRouter from './routes/users.routes.js';
import exercisesRouter from './routes/exercises.routes.js';
import routinesRouter from './routes/routines.routes.js';
import sessionsRouter from './routes/sessions.routes.js';
import workoutsRouter from './routes/workouts.routes.js';

const app = express();
dbConnection();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// API Routes
app.use('/api/login', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/routines', routinesRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/workouts', workoutsRouter);

app.listen(process.env.PORT, ()=>{
    console.log('Server running on port ' + process.env.PORT);
});
