import { Suspense } from "react";

import VendorSignupClient from "./VendorSignupClient";

export default function VendorSignupPage() {
  return (
    <Suspense>
      <VendorSignupClient />
    </Suspense>
  );
}
