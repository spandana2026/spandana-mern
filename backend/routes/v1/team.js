import { Router }      from 'express';
import { requireAdmin, requireTeam } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate }     from '../../middleware/validate.js';
import { z }            from 'zod';
import * as ctrl        from '../../controllers/teamController.js';

const CreateSchema = z.object({ name: z.string().min(1), username: z.string().min(1), password: z.string().min(8), role: z.string().optional() });
const UpdateSchema = z.object({ name: z.string().optional(), password: z.string().min(8).optional(), role: z.string().optional(), active: z.boolean().optional() });

const router = Router();
router.get   ('/admin/team',    requireAdmin, asyncHandler(ctrl.listAll));
router.post  ('/admin/team',    requireAdmin, validate(CreateSchema), asyncHandler(ctrl.create));
router.put   ('/admin/team/:id',requireAdmin, validate(UpdateSchema), asyncHandler(ctrl.update));
router.delete('/admin/team/:id',requireAdmin, asyncHandler(ctrl.remove));

// Fix: Core Team Portal (frontend/src/pages/team-portal.tsx) resources tab —
// route previously did not exist (404 -> forced the team member to be logged out).
router.get   ('/team/resources', requireTeam, asyncHandler(ctrl.getResources));
export default router;
