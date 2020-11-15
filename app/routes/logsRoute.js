// @ts-check
import express from 'express';
import { getAllLogs } from '../controllers/logsController';
import verifyAuth from '../middlewares/auth';
import { getAllLogsSchema } from '../schema/logs';

const router = express.Router();

// router.get('/logs', getAllLogs);
router.get('/logs', verifyAuth, getAllLogsSchema, getAllLogs);

export default router;
