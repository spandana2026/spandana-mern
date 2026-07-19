import { Router }        from 'express';
import { requireAdmin }   from '../../middleware/auth.js';
import { asyncHandler }   from '../../middleware/asyncHandler.js';
import { paginate }       from '../../middleware/paginate.js';
import { uploadGuard }    from '../../middleware/uploadGuard.js';
import { uploadSingle, uploadMultiple } from '../../services/uploadService.js';
import * as ctrl from '../../controllers/galleryController.js';

const router = Router();
router.get   ('/gallery',              paginate,     asyncHandler(ctrl.listPublic));
router.get   ('/admin/gallery',        requireAdmin, paginate, asyncHandler(ctrl.listAdmin));
router.post  ('/admin/gallery',        requireAdmin, asyncHandler(ctrl.create));
router.post  ('/admin/gallery/bulk',   requireAdmin, uploadMultiple, uploadGuard(['image']), asyncHandler(ctrl.uploadBulk));
router.put   ('/admin/gallery/:id',    requireAdmin, asyncHandler(ctrl.update));
router.delete('/admin/gallery/:id',    requireAdmin, asyncHandler(ctrl.remove));
export default router;
