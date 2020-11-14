// @ts-check
import express from 'express';
import { createAuthor, getAllAuthors, getAuthor, updateAuthor, deleteAuthor } from '../controllers/authorController';
import verifyAuth from '../middlewares/auth';
import { createAuthorSchema, updateAuthorSchema, deleteAuthorSchema, getAllAuthorSchema, getAuthorSchema } from '../schema/author';

const router = express.Router();

router.post('/author', verifyAuth, createAuthorSchema, createAuthor);
router.get('/author', verifyAuth, getAllAuthorSchema, getAllAuthors);
router.get('/author/:author_id', verifyAuth, getAuthorSchema, getAuthor);
router.delete('/author/:author_id', verifyAuth, deleteAuthorSchema, deleteAuthor);
router.put('/author/:author_id', verifyAuth, updateAuthorSchema, updateAuthor);

export default router;

// ■ /author - POST - insert a new author with fields: first_first_name, last_name
// ■ /author/{id} - DELETE - delete an author only if not linked to a book
// ■ /author/{id} - PUT - update an author
// ■ /author - GET - retrieve authors allowing filtering and paging
// ■ /author/{id} - GET - retrieve a specific author