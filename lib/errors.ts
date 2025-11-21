export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public fieldErrors?: Array<{ path: string[]; message: string }>
  ) {
    super(message, "VALIDATION_ERROR", 400, fieldErrors);
    this.name = "ValidationError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, public originalError?: unknown) {
    super(message, "DATABASE_ERROR", 500, originalError);
    this.name = "DatabaseError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; details?: unknown };

export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function error(
  message: string,
  code?: string,
  details?: unknown
): ActionResult {
  return { success: false, error: message, code, details };
}

export function handleError(err: unknown): ActionResult {
  if (err instanceof ValidationError) {
    return error(err.message, err.code, err.fieldErrors);
  }

  if (err instanceof AuthenticationError) {
    return error(err.message, err.code);
  }

  if (err instanceof DatabaseError) {
    console.error("Database error:", err.originalError);
    return error(
      "A database error occurred. Please try again later.",
      err.code
    );
  }

  if (err instanceof AppError) {
    return error(err.message, err.code, err.details);
  }

  if (err && typeof err === "object" && "issues" in err) {
    const zodError = err as {
      issues: Array<{ path: (string | number)[]; message: string }>;
    };
    return error(
      "Validation failed",
      "VALIDATION_ERROR",
      zodError.issues.map((issue) => ({
        path: issue.path.map(String),
        message: issue.message,
      }))
    );
  }

  console.error("Unexpected error:", err);
  return error(
    "An unexpected error occurred. Please try again later.",
    "UNKNOWN_ERROR"
  );
}
