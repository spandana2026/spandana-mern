import { Router }       from 'express';
import { requireAdmin }  from '../../middleware/auth.js';
import { asyncHandler }  from '../../middleware/asyncHandler.js';
import { paginate }      from '../../middleware/paginate.js';
import * as ctrl from '../../controllers/testimonialsController.js';

const router = Router();
router.get   ('/testimonials',          paginate, asyncHandler(ctrl.listPublic));
router.get   ('/testimonials/:id',               asyncHandler(ctrl.getOne));
router.get   ('/admin/testimonials',    requireAdmin, paginate, asyncHandler(ctrl.listAdmin));
router.post  ('/admin/testimonials',    requireAdmin, asyncHandler(ctrl.create));
router.put   ('/admin/testimonials/:id',requireAdmin, asyncHandler(ctrl.update));
router.delete('/admin/testimonials/:id',requireAdmin, asyncHandler(ctrl.remove));
export default router;
