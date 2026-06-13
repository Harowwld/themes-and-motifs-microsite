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
      <span key="verified" className="shrink-0 relative" style={{ height: size, width: size }} title="Verified with business documents">
        <Image 
          src={isPremium ? "/badges/premium-badge.png" : "/badges/verified-badge.png"} 
          alt="Verified with business documents" 
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
      <span key="community" className="shrink-0 relative" style={{ height: size, width: size }} title="Community Recognized">
        <Image src="/badges/verified-badge.png" alt="Community Recognized" fill sizes={`${size}px`} className="object-contain" />
      </span>
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
