type ValidationIssue = {
  message?: string;
  path?: Array<string | number>;
};

export function mapValidationErrors(errors: unknown): Record<string, string> {
  if (!Array.isArray(errors)) {
    return {};
  }

  const fieldErrors: Record<string, string> = {};

  for (const issue of errors as ValidationIssue[]) {
    if (!issue?.message) {
      continue;
    }

    const key = Array.isArray(issue.path) && issue.path.length > 0 ? String(issue.path[0]) : "form";
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}
