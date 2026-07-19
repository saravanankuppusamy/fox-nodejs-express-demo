export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        type: 'about:blank',
        title: 'Validation Failed',
        status: 400,
        detail: 'The request body contains invalid data.',
        errors: result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
      });
    }
    req.body = result.data;
    next();
  };
}
