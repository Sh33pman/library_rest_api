// @ts-check
import express from 'express';
import { createBook, getAllBooks, getBook, updateBook } from '../controllers/bookController';
import verifyAuth from '../middlewares/auth';

const router = express.Router();

// ■ /book - POST - insert a new book with fields: name, author, categories, isbn_number, year_published
// ■ /book/{id} - DELETE - delete a book
// ■ /book/{id} - PUT - update a book
// ■ /book - GET - retrieve books allowing filtering and paging
// ■ /book/{id} - GET - retrieve a specific book
router.post('/book', verifyAuth, createBook);
router.get('/book', verifyAuth, getAllBooks);
router.get('/book/:isbn_number', verifyAuth, getBook);
// router.delete('/book/:book_id', verifyAuth, deleteCategory);
router.put('/book/:isbn_number', verifyAuth, updateBook);

export default router;