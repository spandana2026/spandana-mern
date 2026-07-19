import { Router }      from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as ctrl        from '../../controllers/coloringController.js';

// Fix: frontend/src/pages/coloring.tsx called POST /api/coloring/generate,
// which had no matching backend route (generation always failed / 404).
const router = Router();
router.post('/coloring/generate', asyncHandler(ctrl.generate));
export default router;
