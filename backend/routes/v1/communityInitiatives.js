import { Router }       from 'express';
import { requireAdmin }  from '../../middleware/auth.js';
import { asyncHandler }  from '../../middleware/asyncHandler.js';
import * as ctrl from '../../controllers/communityInitiativesController.js';

const router = Router();
router.get   ('/initiatives',          asyncHandler(ctrl.listPublic));
router.get   ('/admin/initiatives',    requireAdmin, asyncHandler(ctrl.listAdmin));
router.post  ('/admin/initiatives',    requireAdmin, asyncHandler(ctrl.create));
router.put   ('/admin/initiatives/:id',requireAdmin, asyncHandler(ctrl.update));
router.delete('/admin/initiatives/:id',requireAdmin, asyncHandler(ctrl.remove));
export default router;
