import express, { json } from 'express';
import cors from 'cors';
import routes from './routes';
import Pusher from 'pusher';

const app = express();

let pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_APP_KEY || '',
  secret: process.env.PUSHER_APP_SECRET || '',
  cluster: process.env.PUSHER_APP_CLUSTER || '',
  useTLS: true,
});

//TODO: Move to separate file in config folder
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  optionsSuccessStatus: 200,
};

app.use(json());
app.use(cors(corsOptions));
app.use('/api', routes);

export default app;
