import Image from "next/image";
import { shouldShowVerifiedBadge } from "@/lib/vendorUtils";

export default function VendorBadges({ 
  documentVerified, 
  isPremium, 
  yearEstablished, 
  size = 36 
}: { 
  documentVerified?: string | null;
  isPremium?: boolean;
  yearEstablished?: string | number | null;
  size?: number;
}) {
  const verifiedStatuses = (documentVerified ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const hasInProgress = verifiedStatuses.includes("verification_in_progress") || verifiedStatuses.includes("pending");
  const hasVerified = !hasInProgress && verifiedStatuses.includes("verified");
  const hasCommunity = !hasInProgress && verifiedStatuses.includes("community_recognized");
  const hasEstablished = !hasInProgress && verifiedStatuses.includes("established_professional");
  
  const yearEst = yearEstablished ? String(yearEstablished).split("-")[0].trim() : null;
  const businessAge = yearEst ? new Date().getFullYear() - parseInt(yearEst) : 0;
  
  const badges = [];

  // 1. Verified Badge
  if (shouldShowVerifiedBadge(documentVerified, isPremium)) {
    badges.push(
      <span key="verified" className="shrink-0 relative" style={{ height: size, width: size }} title="Verified with business document">
        <Image 
          src={isPremium ? "/badges/premium-badge.png" : "/badges/verified-badge.png"} 
          alt="Verified with business document" 
          fill 
          sizes={`${size}px`} 
          className="object-contain" 
        />
      </span>
    );
  }

  // 2. Community Recognized
  if (hasCommunity) {
    badges.push(
      <div key="community" className="relative shrink-0" style={{ height: size, width: size }} title="Community Recognized">
        <svg viewBox="2296 283 599 599" className="h-full w-full select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="nonzero" fill="#e07a90" d="M 2890.210938 579.460938 C 2890.210938 603.738281 2857.238281 623.371094 2851.261719 645.769531 C 2845.058594 668.941406 2863.621094 702.390625 2851.878906 722.679688 C 2839.980469 743.261719 2801.621094 743.828125 2784.921875 760.53125 C 2768.210938 777.238281 2767.640625 815.589844 2747.058594 827.5 C 2726.769531 839.238281 2693.320312 820.679688 2670.148438 826.871094 C 2647.75 832.859375 2628.128906 865.828125 2603.839844 865.828125 C 2579.558594 865.828125 2559.929688 832.859375 2537.539062 826.871094 C 2514.359375 820.679688 2480.921875 839.238281 2460.628906 827.5 C 2440.050781 815.589844 2439.46875 777.238281 2422.769531 760.53125 C 2406.070312 743.828125 2367.710938 743.261719 2355.800781 722.679688 C 2344.070312 702.390625 2362.621094 668.941406 2356.429688 645.769531 C 2350.441406 623.371094 2317.46875 603.738281 2317.46875 579.460938 C 2317.46875 555.179688 2350.441406 535.550781 2356.429688 513.160156 C 2362.621094 489.980469 2344.070312 456.53125 2355.800781 436.238281 C 2367.710938 415.660156 2406.070312 415.089844 2422.769531 398.390625 C 2439.46875 381.679688 2440.050781 343.328125 2460.628906 331.421875 C 2480.921875 319.679688 2514.359375 338.238281 2537.539062 332.050781 C 2559.929688 326.058594 2579.558594 293.089844 2603.839844 293.089844 C 2628.128906 293.089844 2647.75 326.058594 2670.148438 332.050781 C 2693.320312 338.238281 2726.769531 319.679688 2747.058594 331.421875 C 2767.640625 343.328125 2768.210938 381.679688 2784.921875 398.390625 C 2801.621094 415.089844 2839.980469 415.660156 2851.878906 436.25 C 2863.621094 456.53125 2845.058594 489.980469 2851.261719 513.160156 C 2857.238281 535.550781 2890.210938 555.179688 2890.210938 579.460938 Z" />
          <path fillRule="nonzero" fill="white" d="M 2749.328125 490.808594 C 2737.230469 478.710938 2717.621094 478.710938 2705.519531 490.808594 L 2578.648438 617.671875 L 2525.96875 564.988281 C 2513.871094 552.890625 2494.25 552.890625 2482.148438 564.988281 C 2470.050781 577.089844 2470.050781 596.710938 2482.148438 608.808594 L 2555.628906 682.28125 C 2561.960938 688.609375 2570.359375 691.628906 2578.648438 691.328125 C 2586.949219 691.628906 2595.339844 688.609375 2601.671875 682.28125 L 2749.328125 534.621094 C 2761.429688 522.519531 2761.429688 502.910156 2749.328125 490.808594 " />
        </svg>
      </div>
    );
  }

  // 3. Established Professional (25+ or 10+)
  if (businessAge >= 25) {
    badges.push(
      <span key="est25" className="shrink-0 relative" style={{ height: size, width: size }} title="Established (≥ 25 years old)">
        <Image src="/badges/established-25-badge.png" alt="Established (≥ 25 years old)" fill sizes={`${size}px`} className="object-contain" />
      </span>
    );
  } else if (hasEstablished || businessAge >= 10) {
    badges.push(
      <span key="est10" className="shrink-0 relative" style={{ height: size, width: size }} title="Established (≥ 10 years old)">
        <Image src="/badges/established-10-badge.png" alt="Established (≥ 10 years old)" fill sizes={`${size}px`} className="object-contain" />
      </span>
    );
  }
  
  if (badges.length === 0) return null;

  return (
    <div className="flex items-center gap-1 shrink-0">
      {badges}
    </div>
  );
}
