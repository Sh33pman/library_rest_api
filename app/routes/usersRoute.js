// @ts-check

import express from 'express';

import { signupUser, siginUser } from '../controllers/userController';
import { signUpUserSchema, logInUserSchema } from '../schema/user';

const router = express.Router();

// users Routes
router.post('/auth/signup', signUpUserSchema, signupUser);
router.post('/auth/signin', logInUserSchema, siginUser);

export default router;