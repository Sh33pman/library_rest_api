// @ts-check
import express from 'express';
import { createBook } from '../controllers/bookController';
import verifyAuth from '../middlewares/auth';

const router = express.Router();

// ■ /book - POST - insert a new book with fields: name, author, categories, isbn_number, year_published
// ■ /book/{id} - DELETE - delete a book
// ■ /book/{id} - PUT - update a book
// ■ /book - GET - retrieve books allowing filtering and paging
// ■ /book/{id} - GET - retrieve a specific book
router.post('/book', verifyAuth, createBook);
// router.get('/book', verifyAuth, getAllCategories);
// router.get('/book/:book_id', verifyAuth, getCategory);
// router.delete('/book/:book_id', verifyAuth, deleteCategory);
// router.put('/book/:book_id', verifyAuth, updateCategory);

export default router;