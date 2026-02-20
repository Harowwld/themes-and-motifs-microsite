"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const id = window.setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => window.clearTimeout(id);
  }, [router]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 20% 10%, #fff7ed, #fcfbf9 42%, #f6f1ea 92%)",
      }}
    >
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">Successfully registered</div>
            <div className="mt-2 text-[13px] leading-6 text-black/60">
              Thanks! Your vendor registration has been submitted. We’ll review it and get back to you.
            </div>
            <div className="mt-4 text-[12px] text-black/45">Redirecting to the homepage in 5 seconds…</div>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors"
            >
              Go to homepage now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
