"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BootstrapPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/bootstrap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create admin");
      }

      setResult({
        success: true,
        message: `Admin created successfully! You can now log in with ${email}`,
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err: any) {
      setResult({
        success: false,
        message: err?.message ?? "Failed to create admin",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto w-full max-w-xl px-5 sm:px-8 py-12">
        <div className="rounded-[3px] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="p-7">
            <div className="rounded-[3px] border border-[#b42318]/20 bg-[#fff1f3] px-4 py-3 mb-6">
              <div className="text-[13px] font-semibold text-[#7a271a]">Emergency Bootstrap</div>
              <div className="mt-1 text-[12px] text-[#7a271a]/80">
                This creates the first superadmin when no admins exist. Only works once.
              </div>
            </div>

            <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#2c2c2c]">
              Create First Admin
            </div>
            <div className="mt-2 text-[13px] text-black/60">
              Set up the initial superadmin account.
            </div>

            {result ? (
              <div
                className={`mt-4 rounded-[3px] px-4 py-3 text-[13px] ${
                  result.success
                    ? "border border-black/10 bg-[#f0fdf4] text-[#166534]"
                    : "border border-[#b42318]/20 bg-[#fff1f3] text-[#7a271a]"
                }`}
              >
                {result.message}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="admin@yourdomain.com"
                  required
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[12px] font-semibold text-black/55">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-[3px] border border-black/10 bg-white px-3 text-[14px] text-[#2c2c2c] placeholder:text-black/35 outline-none focus:border-[#a67c52]/50 focus:ring-2 focus:ring-[#a67c52]/15"
                  placeholder="Min 8 characters"
                  minLength={8}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 inline-flex items-center justify-center px-4 rounded-[3px] bg-[#a67c52] text-white text-[13px] font-semibold hover:bg-[#8e6a46] transition-colors disabled:opacity-60"
              >
                {isSubmitting ? "Creating..." : "Create Admin"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
