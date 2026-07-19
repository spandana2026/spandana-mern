import { Router }      from 'express';
import { requireAdmin } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate }     from '../../middleware/validate.js';
import { paginate }     from '../../middleware/paginate.js';
import { z }            from 'zod';
import * as ctrl        from '../../controllers/volunteersController.js';

const VolunteerSchema = z.object({
  fullName:    z.string().min(2),
  email:       z.string().email(),
  phone:       z.string().optional(),
  dob:         z.string().optional(),
  age:         z.string().optional(),
  address:     z.string().optional(),
  occupation:  z.string().optional(),
  skills:      z.string().optional(),
  motivation:  z.string().optional(),
  areasOfInterest: z.array(z.string()).optional(),
  availability:    z.array(z.string()).optional(),
  emergencyContactName:  z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  declaration:         z.boolean().optional(),
  childrenDeclaration: z.boolean().optional(),
  formType:            z.string().optional(),
});

const router = Router();
router.post  ('/volunteers',           validate(VolunteerSchema), asyncHandler(ctrl.submit));
router.get   ('/admin/volunteers',     requireAdmin, paginate,    asyncHandler(ctrl.listAll));
router.delete('/admin/volunteers/:id', requireAdmin,             asyncHandler(ctrl.remove));
export default router;
