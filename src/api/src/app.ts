// import { Express } from "express";

import express, { json } from 'express';
import routes from './routes';

const app = express();
app.use(json());
app.use('/api', routes);

// app.get('/', (req, res) => {
//   res.send('Hello Frendl!');
// });

export default app;
