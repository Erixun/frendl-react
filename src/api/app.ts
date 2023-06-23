import express, { json } from 'express';
import cors from 'cors';
import routes from './routes';
import corsOptions from './config/corsOptions';

const app = express();

app.use(json());
app.use(cors(corsOptions));
app.use('/api', routes);

export default app;
