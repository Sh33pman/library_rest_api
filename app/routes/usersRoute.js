// @ts-check

import express from 'express';

import { signupUser, siginUser, getUser } from '../controllers/userController';
import { signUpUserSchema, logInUserSchema } from '../schema/user';
import verifyAuth from '../middlewares/auth';

const router = express.Router();

router.post('/signup', signUpUserSchema, signupUser);
router.post('/signin', logInUserSchema, siginUser);
router.get('/user', verifyAuth, getUser);

export default router;