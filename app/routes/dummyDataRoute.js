// @ts-check

import express from 'express';

import { loadDummyData } from '../controllers/dummyDataController';

const router = express.Router();

router.get('/load_data', loadDummyData);

export default router;