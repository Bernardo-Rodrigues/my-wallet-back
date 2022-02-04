import { Router } from 'express';
import authRouter from './authRouter.js';
import transactionRouter from './transactionRouter.js';

const router = Router();
router.use(authRouter)
router.use(transactionRouter)

export default router;