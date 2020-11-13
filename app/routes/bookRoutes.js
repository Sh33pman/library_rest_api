// @ts-check
import express from 'express';
import { createBook, getAllBooks, getBook, updateBook, deleteBook } from '../controllers/bookController';
import verifyAuth from '../middlewares/auth';

const router = express.Router();

router.post('/book', verifyAuth, createBook);
router.get('/book', verifyAuth, getAllBooks);
router.get('/book/:isbn_number', verifyAuth, getBook);
router.delete('/book/:isbn_number', verifyAuth, deleteBook);
router.put('/book/:isbn_number', verifyAuth, updateBook);

export default router;