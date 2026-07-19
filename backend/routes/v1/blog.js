import { Router }       from 'express';
import { requireAdmin }  from '../../middleware/auth.js';
import { asyncHandler }  from '../../middleware/asyncHandler.js';
import { paginate }      from '../../middleware/paginate.js';
import * as ctrl from '../../controllers/blogController.js';

const router = Router();
router.get   ('/blog',          paginate, asyncHandler(ctrl.listPublic));
router.get   ('/blog/:id',               asyncHandler(ctrl.getOne));
router.get   ('/admin/blog',    requireAdmin, paginate, asyncHandler(ctrl.listAdmin));
router.post  ('/admin/blog',    requireAdmin, asyncHandler(ctrl.create));
router.put   ('/admin/blog/:id',requireAdmin, asyncHandler(ctrl.update));
router.delete('/admin/blog/:id',requireAdmin, asyncHandler(ctrl.remove));

// Aliases used by frontend (blog.tsx uses /posts, BlogPostsTab.tsx uses /admin/blog-posts)
router.get   ('/posts',                   paginate, asyncHandler(ctrl.listPublic));
router.get   ('/admin/blog-posts',        requireAdmin, paginate, asyncHandler(ctrl.listAdmin));
router.post  ('/admin/blog-posts',        requireAdmin, asyncHandler(ctrl.create));
router.put   ('/admin/blog-posts/:id',    requireAdmin, asyncHandler(ctrl.update));
router.delete('/admin/blog-posts/:id',    requireAdmin, asyncHandler(ctrl.remove));
export default router;
