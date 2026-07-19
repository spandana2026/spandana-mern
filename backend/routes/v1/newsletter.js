import { Router }      from 'express';
import { requireAdmin } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate }     from '../../middleware/validate.js';
import { paginate }     from '../../middleware/paginate.js';
import { z }            from 'zod';
import * as ctrl        from '../../controllers/newsletterController.js';

const EmailSchema = z.object({ email: z.string().email() });

const router = Router();
router.post  ('/newsletter/subscribe',   validate(EmailSchema), asyncHandler(ctrl.subscribe));
router.post  ('/newsletter/unsubscribe', validate(EmailSchema), asyncHandler(ctrl.unsubscribe));
router.get   ('/admin/newsletter',       requireAdmin, paginate, asyncHandler(ctrl.listAll));
// Aliases used by the admin SubscribersTab
router.get   ('/newsletter/subscribers',   requireAdmin, asyncHandler(ctrl.listAll));
router.post  ('/newsletter/sync-to-sheet', requireAdmin, asyncHandler(ctrl.syncToSheet));
export default router;
