"use client";

import { useEffect } from "react";

/**
 * Global error handler to suppress React cancellation errors
 * These are expected during navigation and should not be shown as errors
 */
export function ErrorHandler() {
  useEffect(() => {
    // Intercept console.error to suppress Monaco Editor cancellation errors
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      // Check all arguments for cancellation-related content
      const errorString = args
        .map((arg) => {
          if (typeof arg === "string") return arg;
          if (arg instanceof Error) {
            return `${arg.message || ""} ${arg.stack || ""}`;
          }
          if (arg && typeof arg === "object") {
            if ("message" in arg) return String(arg.message);
            if ("stack" in arg) return String(arg.stack);
            return JSON.stringify(arg);
          }
          return String(arg);
        })
        .join(" ");

      // Suppress Monaco Editor cancellation errors (check for various patterns)
      const isMonacoCancelError =
        errorString.includes("ERR Canceled") ||
        errorString.includes("Canceled: Canceled") ||
        errorString.includes("at of.cancel") ||
        errorString.includes("editor.api") ||
        (errorString.includes("Canceled") && errorString.includes("editor"));

      if (isMonacoCancelError) {
        return; // Don't log cancellation errors
      }

      // Suppress React cancellation errors
      if (
        args.length > 0 &&
        typeof args[0] === "object" &&
        args[0] !== null &&
        "type" in args[0] &&
        (args[0] as { type?: string }).type === "cancelation"
      ) {
        return; // Don't log cancellation errors
      }

      // Call original console.error for other errors
      originalConsoleError.apply(console, args);
    };

    // Handle unhandled promise rejections (cancellation errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      // Check if it's a React cancellation error
      if (
        reason &&
        typeof reason === "object" &&
        ("type" in reason
          ? reason.type === "cancelation"
          : "msg" in reason && reason.msg === "operation is manually canceled")
      ) {
        event.preventDefault();
        return;
      }

      // Check for Monaco Editor cancellation errors
      if (
        reason &&
        ((typeof reason === "string" && reason.includes("Canceled")) ||
        (typeof reason === "object" &&
          "message" in reason &&
          (reason.message === "Canceled" ||
            String(reason.message).includes("Canceled"))))
      ) {
        event.preventDefault();
        return;
      }
    };

    // Handle general errors (including Monaco Editor errors)
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      const message = event.message || (error && typeof error === "object" && "message" in error ? String(error.message) : "");
      
      // Suppress React cancellation errors
      if (
        error &&
        typeof error === "object" &&
        "type" in error &&
        error.type === "cancelation"
      ) {
        event.preventDefault();
        return false;
      }

      // Suppress Monaco Editor cancellation errors
      if (
        message.includes("Canceled") ||
        message.includes("ERR Canceled") ||
        (error && typeof error === "object" && "message" in error && String(error.message).includes("Canceled"))
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      // Restore original console.error
      console.error = originalConsoleError;
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}

