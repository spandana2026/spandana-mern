import { Router }       from 'express';
import { requireAdmin }  from '../../middleware/auth.js';
import { asyncHandler }  from '../../middleware/asyncHandler.js';
import { paginate }      from '../../middleware/paginate.js';
import * as ctrl from '../../controllers/programsController.js';

const router = Router();
router.get   ('/programs',          paginate, asyncHandler(ctrl.listPublic));
router.get   ('/programs/:id',               asyncHandler(ctrl.getOne));
router.get   ('/admin/programs',    requireAdmin, paginate, asyncHandler(ctrl.listAdmin));
router.post  ('/admin/programs',    requireAdmin, asyncHandler(ctrl.create));
router.put   ('/admin/programs/:id',requireAdmin, asyncHandler(ctrl.update));
router.delete('/admin/programs/:id',requireAdmin, asyncHandler(ctrl.remove));
export default router;
