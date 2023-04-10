import { Router } from 'express';
import zone from './zone';

const router = Router();

router.use('/api', zone);

export default router;
