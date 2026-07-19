import { ZodError } from 'zod';

/**
 * validate — Zod request body/query validation middleware factory.
 * Fix #21: every POST/PUT route validates its input.
 *
 * Usage:
 *   router.post('/items', validate(ItemSchema), asyncHandler(ctrl.create))
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return res.status(400).json({ error: 'Validation failed', details: errors, requestId: req.id });
    }
    req[source] = result.data;
    next();
  };
}
