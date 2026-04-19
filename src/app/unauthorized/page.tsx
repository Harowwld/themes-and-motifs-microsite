import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#fafafa]">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <svg
            viewBox="0 0 280 200"
            className="w-64 h-auto mx-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="90"
              y="60"
              width="100"
              height="120"
              rx="8"
              fill="#f5f0e8"
              stroke="#a68b6a"
              strokeWidth="2"
            />
            <rect
              x="100"
              y="70"
              width="80"
              height="100"
              rx="4"
              fill="#fff"
              stroke="#a68b6a"
              strokeWidth="1.5"
            />
            <circle
              cx="140"
              cy="120"
              r="20"
              fill="#a68b6a"
              opacity="0.15"
              stroke="#a68b6a"
              strokeWidth="2"
            />
            <path
              d="M130 120C130 115.5 133.5 112 138 112C142.5 112 146 115.5 146 120C146 124.5 142.5 128 138 128C133.5 128 130 124.5 130 120Z"
              fill="#a68b6a"
            />
            <rect
              x="136"
              y="112"
              width="4"
              height="16"
              rx="2"
              fill="#a68b6a"
            />
            <circle cx="138" cy="136" r="2" fill="#a68b6a" />
            <path
              d="M115 85L120 90L130 80"
              stroke="#a68b6a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
            />
            <path
              d="M165 85L160 90L150 80"
              stroke="#a68b6a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
            />
            <circle cx="110" cy="75" r="2" fill="#a68b6a" opacity="0.3" />
            <circle cx="170" cy="75" r="2" fill="#a68b6a" opacity="0.3" />
            <circle cx="105" cy="155" r="2" fill="#a68b6a" opacity="0.25" />
            <circle cx="175" cy="155" r="2" fill="#a68b6a" opacity="0.25" />
            <path
              d="M100 50L105 55L100 60L95 55L100 50Z"
              fill="#a68b6a"
              opacity="0.5"
            />
            <path
              d="M180 50L185 55L180 60L175 55L180 50Z"
              fill="#a68b6a"
              opacity="0.5"
            />
          </svg>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <Lock className="w-5 h-5 text-[#a68b6a]" />
          <h1 className="font-headline text-4xl text-[#2c2c2c]">
            Access Restricted
          </h1>
        </div>
        <p className="text-gray-600 mb-8 leading-relaxed">
          This area is reserved for authorized personnel only.
          If you believe you should have access, please contact the administrator.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#a68b6a] text-white rounded-lg font-medium text-sm hover:bg-[#957a5c] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
}
