import dotenv from 'dotenv';
dotenv.config();

const corsOptions = {
  origin: '*', //process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  optionsSuccessStatus: 200,
  // allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
};

export default corsOptions;
