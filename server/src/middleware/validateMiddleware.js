/**
 * Middleware factory for validating request bodies using Zod schemas
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Invalid request data.';
      return res.status(400).json({
        error: firstError,
        details: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Replace req.body with parsed/sanitized data
    req.body = result.data;
    next();
  };
};
