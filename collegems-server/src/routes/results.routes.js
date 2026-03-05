import express from 'express';
import { getResults } from '../controllers/results.controller.js';
const router = express.Router();

router.get('/', getResults);
export default router;
