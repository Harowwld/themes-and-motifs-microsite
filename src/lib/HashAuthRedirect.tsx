"use client";

import { useEffect } from "react";

export default function HashAuthRedirect() {
  useEffect(() => {
    const { pathname, hash, search } = window.location;
    
    // Handle fragment-based auth (Implicit flow)
    if (hash) {
      const h = hash.startsWith("#") ? hash.slice(1) : hash;
      const params = new URLSearchParams(h);
      const hasAccessToken = Boolean(params.get("access_token"));
      const type = params.get("type");

      if (pathname === "/" && hasAccessToken && (type === "invite" || type === "magiclink" || type === "recovery")) {
        window.location.replace(`/vendor/signup#${h}`);
        return;
      }
    }

    // Handle code-based auth (PKCE flow) on root
    if (search) {
      const s = search.startsWith("?") ? search.slice(1) : search;
      const params = new URLSearchParams(s);
      const code = params.get("code");

      if (pathname === "/" && code) {
        window.location.replace(`/editor/verify?${s}`);
        return;
      }
    }
  }, []);

  return null;
}
