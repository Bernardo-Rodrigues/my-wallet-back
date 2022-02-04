import { Router } from 'express';
import validateSchemaMiddleware from '../middlewares/validateSchemaMiddleware.js';
import validateTokenMiddleware from '../middlewares/validateTokenMiddleware.js';
import { deleteTransaction, getTransactions, postTransaction, updateTransaction } from '../controllers/transactionsController.js';

const transactionRouter = Router();

transactionRouter.get('/transactions', validateTokenMiddleware, getTransactions);
transactionRouter.post('/transactions', validateTokenMiddleware, validateSchemaMiddleware , postTransaction);
transactionRouter.delete('/transactions/:id', validateTokenMiddleware, deleteTransaction);
transactionRouter.put('/transactions/:id', validateTokenMiddleware, validateSchemaMiddleware, updateTransaction);

export default transactionRouter;