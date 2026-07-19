import { Router }       from 'express';
import { requireAdmin }  from '../../middleware/auth.js';
import { asyncHandler }  from '../../middleware/asyncHandler.js';
import { paginate }      from '../../middleware/paginate.js';
import * as ctrl from '../../controllers/storiesController.js';

const router = Router();
router.get   ('/stories',          paginate, asyncHandler(ctrl.listPublic));
router.get   ('/stories/:id',               asyncHandler(ctrl.getOne));
router.get   ('/admin/stories',    requireAdmin, paginate, asyncHandler(ctrl.listAdmin));
router.post  ('/admin/stories',    requireAdmin, asyncHandler(ctrl.create));
router.put   ('/admin/stories/:id',requireAdmin, asyncHandler(ctrl.update));
router.delete('/admin/stories/:id',requireAdmin, asyncHandler(ctrl.remove));
export default router;
