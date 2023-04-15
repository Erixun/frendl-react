import express, { json } from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

//TODO: Move to separate file in config folder
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  optionsSuccessStatus: 200,
};

app.use(json());
app.use(cors(corsOptions));
app.use('/api', routes);

export default app;
