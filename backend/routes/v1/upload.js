import { Router }        from 'express';
import { requireAdmin }   from '../../middleware/auth.js';
import { asyncHandler }   from '../../middleware/asyncHandler.js';
import { uploadSingle }   from '../../services/uploadService.js';
import { uploadGuard }    from '../../middleware/uploadGuard.js';
import * as ctrl from '../../controllers/uploadController.js';

const router = Router();
// Generic single-image upload used by many admin tabs (Site Info, Hero, Donate,
// Fun Zone, SEO, Community Initiatives, Health Programs, etc.)
router.post('/upload', requireAdmin, uploadSingle, uploadGuard(['image']), asyncHandler(ctrl.upload));
export default router;
