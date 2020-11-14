// @ts-check
import express from 'express';
import { createBook, getAllBooks, getBook, updateBook, deleteBook } from '../controllers/bookController';
import verifyAuth from '../middlewares/auth';
import { createBookSchema, getAllBookSchema, getBookSchema, updateBookSchema, deleteBookSchema } from '../schema/book';

const router = express.Router();

router.post('/book', verifyAuth, createBookSchema, createBook);
router.get('/book', verifyAuth, getAllBookSchema, getAllBooks);
router.get('/book/:isbn_number', verifyAuth, getBookSchema, getBook);
router.delete('/book/:isbn_number', verifyAuth, deleteBookSchema, deleteBook);
router.put('/book/:isbn_number', verifyAuth, updateBookSchema, updateBook);

export default router;