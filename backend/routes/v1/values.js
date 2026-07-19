import { Router }       from 'express';
import { requireAdmin }  from '../../middleware/auth.js';
import { asyncHandler }  from '../../middleware/asyncHandler.js';
import { paginate }      from '../../middleware/paginate.js';
import * as ctrl from '../../controllers/valuesController.js';

const router = Router();
router.get   ('/values',          paginate, asyncHandler(ctrl.listPublic));
router.get   ('/values/:id',               asyncHandler(ctrl.getOne));
router.get   ('/admin/values',    requireAdmin, paginate, asyncHandler(ctrl.listAdmin));
router.post  ('/admin/values',    requireAdmin, asyncHandler(ctrl.create));
router.put   ('/admin/values/:id',requireAdmin, asyncHandler(ctrl.update));
router.delete('/admin/values/:id',requireAdmin, asyncHandler(ctrl.remove));
export default router;
