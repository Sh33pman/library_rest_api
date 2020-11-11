// @ts-check

import express from 'express';

import { signupUser, siginUser } from '../controllers/userController';

const router = express.Router();

// users Routes
router.post('/auth/signup', signupUser);
router.post('/auth/signin', siginUser);

export default router;