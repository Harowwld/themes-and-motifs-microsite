"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-[#2c2c2c] mb-4">Something went wrong!</h2>
        <p className="text-[#2c2c2c]/70 mb-8">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <button
          onClick={() => reset()}
          className="h-11 inline-flex items-center justify-center px-6 rounded-md bg-[#a67c52] text-white font-medium hover:bg-[#8e6a46] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
