import { Router }      from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate }     from '../../middleware/validate.js';
import { rateLimit }    from 'express-rate-limit';
import { z }            from 'zod';
import * as ctrl        from '../../controllers/contactController.js';

const ContactSchema = z.object({
  fullName: z.string().min(2),
  email:    z.string().email(),
  phone:    z.string().optional(),
  message:  z.string().min(10),
});

// Stricter rate limit on contact form to prevent spam
const contactLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many submissions. Please wait 15 minutes.' } });

const router = Router();
router.post('/contact', contactLimit, validate(ContactSchema), asyncHandler(ctrl.submit));
export default router;
