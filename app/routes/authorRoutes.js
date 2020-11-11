// @ts-check
import express from 'express';
import { createAuthor, getAllAuthors, getAuthor, updateAuthor, deleteAuthor } from '../controllers/authorController';
import verifyAuth from '../middlewares/auth';

const router = express.Router();

router.post('/author', verifyAuth, createAuthor);
router.get('/author', verifyAuth, getAllAuthors);
router.get('/author/:author_id', verifyAuth, getAuthor);
router.delete('/author/:author_id', verifyAuth, deleteAuthor);
router.put('/author/:author_id', verifyAuth, updateAuthor);

export default router;

// ■ /author - POST - insert a new author with fields: first_first_name, last_name
// ■ /author/{id} - DELETE - delete an author only if not linked to a book
// ■ /author/{id} - PUT - update an author
// ■ /author - GET - retrieve authors allowing filtering and paging
// ■ /author/{id} - GET - retrieve a specific author