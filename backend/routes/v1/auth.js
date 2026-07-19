import { Router }      from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate }     from '../../middleware/validate.js';
import { z }            from 'zod';
import * as ctrl        from '../../controllers/authController.js';

const LoginSchema = z.object({ password: z.string().min(1) });
const TeamSchema  = z.object({ username: z.string().min(1), password: z.string().min(1) });

const router = Router();
router.post('/auth/admin/login', validate(LoginSchema), asyncHandler(ctrl.adminLogin));
router.post('/auth/team/login',  validate(TeamSchema),  asyncHandler(ctrl.teamLogin));
router.post('/auth/logout',                             asyncHandler(ctrl.logout));
export default router;
