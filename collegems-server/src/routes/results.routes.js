import express from 'express';
import { createResult, getResults, publishResult } from '../controllers/results.controller.js';
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/my", protect, getResults);
router.post('/create', protect, createResult);
router.put('/:id/publish', protect, publishResult);
export default router;
