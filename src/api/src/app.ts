import express, { json } from 'express';
import cors from 'cors';
import routes from './routes';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

//TODO: Move to separate file in config folder
const corsOptions = {
  origin: '*', //process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  optionsSuccessStatus: 200,
  // allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
};

app.use(json());
app.use(cors(corsOptions));
app.use('/api', routes);

export default app;
