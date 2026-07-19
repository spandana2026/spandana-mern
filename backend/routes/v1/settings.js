import { Router }      from 'express';
import { requireAdmin } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as ctrl        from '../../controllers/settingsController.js';

const router = Router();
router.get ('/settings',                      asyncHandler(ctrl.getPublicSettings));
router.get ('/admin/settings/draft',          requireAdmin, asyncHandler(ctrl.getDraft));
router.get ('/admin/settings/status',         requireAdmin, asyncHandler(ctrl.getStatus));
router.put ('/admin/settings',                requireAdmin, asyncHandler(ctrl.saveDraft));
router.post('/admin/settings/publish',        requireAdmin, asyncHandler(ctrl.publishSettings));
router.get ('/admin/settings/history/:index', requireAdmin, asyncHandler(ctrl.getHistoryEntry));

// Fix: footer.tsx visitor counter (public, no auth)
router.get ('/visitor-count',           asyncHandler(ctrl.getVisitorCount));
router.post('/visitor-count/increment', asyncHandler(ctrl.incrementVisitorCount));
export default router;
