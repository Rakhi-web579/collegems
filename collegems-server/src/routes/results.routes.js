import express from 'express';
import { createResult, getResults, publishResult, publishPreview, publishAll } from '../controllers/results.controller.js';
import { protect } from "../middlewares/auth.middleware.js";
import { checkDataLock } from "../middlewares/dataLock.middleware.js";
import { auditAction } from "../middlewares/audit.middleware.js";
const router = express.Router();

router.get("/my", protect, getResults);
router.post('/create', protect, checkDataLock('results'), auditAction('CREATE_RESULT', 'Results'), createResult);
router.put('/:id/publish', protect, checkDataLock('results'), auditAction('PUBLISH_RESULT', 'Results'), publishResult);
router.post('/publish-preview', protect, checkDataLock('results'), publishPreview);
router.post('/publish-all', protect, checkDataLock('results'), auditAction('BULK_PUBLISH_RESULTS', 'Results'), publishAll);
export default router;
