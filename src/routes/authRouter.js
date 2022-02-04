import { Router } from 'express';
import { signIn, signUp } from '../controllers/authController.js';
import validateSchemaMiddleware from '../middlewares/validateSchemaMiddleware.js';

const authRouter = Router();

authRouter.post('/signup', validateSchemaMiddleware, signUp);
authRouter.post('/signin', validateSchemaMiddleware, signIn);

export default authRouter;