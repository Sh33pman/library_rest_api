// @ts-check
import express from 'express';
import { createCategory, getAllCategories, getCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import verifyAuth from '../middlewares/auth';

const router = express.Router();

router.post('/category', verifyAuth, createCategory);
router.get('/category', verifyAuth, getAllCategories);
router.get('/category/:category_id', verifyAuth, getCategory);
router.delete('/category/:category_id', verifyAuth, deleteCategory);
router.put('/category/:category_id', verifyAuth, updateCategory);

export default router;
// /category - POST - insert a new category with fields: name, description
// ■ /category/{id} - DELETE - delete a category only if not linked to a book
// ■ /category/{id} - PUT - update a category
// ■ /category - GET - retrieve categories allowing filtering and paging
// ■ /category/{id} - GET - retrieve a specific category