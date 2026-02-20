"use client";

import { useEffect } from "react";

export default function HashAuthRedirect() {
  useEffect(() => {
    const { pathname, hash } = window.location;
    if (!hash) return;

    const h = hash.startsWith("#") ? hash.slice(1) : hash;
    const params = new URLSearchParams(h);

    const hasAccessToken = Boolean(params.get("access_token"));
    const type = params.get("type");

    if (pathname === "/" && hasAccessToken && (type === "invite" || type === "magiclink" || type === "recovery")) {
      window.location.replace(`/vendor/signup#${h}`);
    }
  }, []);

  return null;
}
