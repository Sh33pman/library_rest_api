// @ts-check

import express from 'express';

import { loadDummyData } from '../controllers/dummyDataController';
import { signUpUserSchema, logInUserSchema } from '../schema/user';
import verifyAuth from '../middlewares/auth';

const router = express.Router();

router.get('/load_data', loadDummyData);

export default router;