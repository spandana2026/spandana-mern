import { Router }         from 'express';
import { requireAdmin }    from '../../middleware/auth.js';
import { asyncHandler }    from '../../middleware/asyncHandler.js';
import { uploadZipSingle } from '../../services/uploadService.js';
import * as ctrl from '../../controllers/gameListingsController.js';

const router = Router();
router.get   ('/game-listings',                    asyncHandler(ctrl.listPublic));
router.get   ('/admin/game-listings',               requireAdmin, asyncHandler(ctrl.listAdmin));
router.post  ('/admin/game-listings',               requireAdmin, asyncHandler(ctrl.create));
router.put   ('/admin/game-listings/:id',           requireAdmin, asyncHandler(ctrl.update));
router.delete('/admin/game-listings/:id',           requireAdmin, asyncHandler(ctrl.remove));
router.post  ('/admin/game-listings/upload-zip',    requireAdmin, uploadZipSingle, asyncHandler(ctrl.uploadZip));
export default router;
