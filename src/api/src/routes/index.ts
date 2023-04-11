import { Router } from 'express';
import zoneRouter from './zoneRouter';

const router = Router();

router.use('/zone', zoneRouter);

export default router;
