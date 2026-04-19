import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
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
            <path
              d="M140 20C140 20 100 60 60 80C40 90 20 110 20 140C20 170 60 180 100 180C120 180 140 175 160 175C180 175 200 180 220 180C260 180 280 170 280 140C280 110 260 90 240 80C200 60 140 20 140 20Z"
              fill="#f5f0e8"
              stroke="#a68b6a"
              strokeWidth="2"
            />
            <path
              d="M140 40C140 40 110 70 80 85C65 92 50 107 50 132C50 157 80 170 110 170C125 170 140 166 155 166C170 166 185 170 200 170C230 170 250 157 250 132C250 107 235 92 220 85C190 70 140 40 140 40Z"
              fill="#fff"
              stroke="#a68b6a"
              strokeWidth="1.5"
            />
            <circle cx="110" cy="125" r="8" fill="#a68b6a" opacity="0.3" />
            <circle cx="190" cy="125" r="8" fill="#a68b6a" opacity="0.3" />
            <path
              d="M130 115C130 115 140 105 150 115"
              stroke="#a68b6a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M135 140C140 145 150 145 155 140"
              stroke="#a68b6a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M140 50L145 65L140 60L135 65L140 50Z"
              fill="#a68b6a"
              opacity="0.5"
            />
            <path
              d="M90 75L93 83L90 80L87 83L90 75Z"
              fill="#a68b6a"
              opacity="0.4"
            />
            <path
              d="M200 70L203 78L200 75L197 78L200 70Z"
              fill="#a68b6a"
              opacity="0.4"
            />
            <circle cx="70" cy="100" r="3" fill="#a68b6a" opacity="0.3" />
            <circle cx="220" cy="95" r="3" fill="#a68b6a" opacity="0.3" />
            <circle cx="55" cy="150" r="2" fill="#a68b6a" opacity="0.25" />
            <circle cx="235" cy="145" r="2" fill="#a68b6a" opacity="0.25" />
          </svg>
        </div>

        <h1 className="font-headline text-4xl text-[#2c2c2c] mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The page you&apos;re looking for seems to have wandered off the path.
          Perhaps it was never here, or it&apos;s been rearranged.
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
