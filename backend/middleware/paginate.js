/**
 * paginate — extracts ?page=&limit= from query and attaches to req.
 * Fix #9: applied to every list endpoint.
 *
 * Usage:
 *   router.get('/items', paginate, asyncHandler(async (req, res) => {
 *     const { page, limit, skip } = req.pagination;
 *     const items = await Item.getAll({ skip, limit });
 *     res.json({ data: items, page, limit });
 *   }));
 */
export function paginate(req, _res, next) {
  const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
  const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit || '1000', 10)));
  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
}
