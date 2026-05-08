// Error handling utilities for sanitizing error messages

import { NextResponse } from "next/server";

// Log levels
export type LogLevel = "error" | "warn" | "info" | "debug";

// Server-side error logging
export function logError(
  message: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorDetails = {
    message,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };
  
  // Log to console (in production, this could go to a logging service)
  console.error("[SERVER ERROR]", errorDetails);
}

export function logWarn(
  message: string,
  context?: Record<string, unknown>
): void {
  console.warn("[SERVER WARN]", { message, context, timestamp: new Date().toISOString() });
}

// Sanitize error message for client response
export function sanitizeErrorMessage(
  error: unknown,
  defaultMessage = "An error occurred"
): string {
  // Never expose internal error details to clients for 500 errors
  if (error instanceof Error) {
    // Check if it's a validation error (safe to expose)
    const isValidationError = 
      error.message.includes("validation") ||
      error.message.includes("invalid") ||
      error.message.includes("required");
    
    if (isValidationError) {
      return error.message;
    }
  }
  
  return defaultMessage;
}

// Create a safe error response for API routes
export function createErrorResponse(
  error: unknown,
  statusCode: number,
  logContext?: Record<string, unknown>
): NextResponse {
  // Log the actual error server-side
  if (statusCode >= 500) {
    logError("API Error", error, logContext);
  }

  // Determine if we can expose the error message
  const isClientError = statusCode >= 400 && statusCode < 500;
  const message = isClientError
    ? sanitizeErrorMessage(error, "Invalid request")
    : "Internal server error";

  return NextResponse.json(
    { error: message },
    { status: statusCode }
  );
}

// Safe wrapper for async route handlers
export function withErrorHandling(
  handler: (req: Request) => Promise<Response>,
  options?: {
    logContext?: Record<string, unknown>;
  }
) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      const statusCode = 
        typeof (error as any)?.statusCode === "number"
          ? (error as any).statusCode
          : 500;
      
      return createErrorResponse(error, statusCode, {
        ...options?.logContext,
        url: req.url,
        method: req.method,
      });
    }
  };
}

// HTTP status codes as constants
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Common error messages (safe to expose to clients)
export const CLIENT_ERRORS = {
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Access denied",
  NOT_FOUND: "Resource not found",
  INVALID_INPUT: "Invalid input",
  RATE_LIMITED: "Too many requests. Please try again later.",
  INTERNAL_ERROR: "Internal server error",
} as const;
