import { VendorsPageSkeleton } from "./page";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
      <VendorsPageSkeleton />
    </div>
  );
}
