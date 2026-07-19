import { Router }       from 'express';
import { requireAdmin }  from '../../middleware/auth.js';
import { asyncHandler }  from '../../middleware/asyncHandler.js';
import { paginate }      from '../../middleware/paginate.js';
import * as ctrl from '../../controllers/eventsController.js';

const router = Router();
router.get   ('/events',          paginate, asyncHandler(ctrl.listPublic));
router.get   ('/events/:id',               asyncHandler(ctrl.getOne));
router.get   ('/admin/events',    requireAdmin, paginate, asyncHandler(ctrl.listAdmin));
router.post  ('/admin/events',    requireAdmin, asyncHandler(ctrl.create));
router.put   ('/admin/events/:id',requireAdmin, asyncHandler(ctrl.update));
router.delete('/admin/events/:id',requireAdmin, asyncHandler(ctrl.remove));
export default router;
