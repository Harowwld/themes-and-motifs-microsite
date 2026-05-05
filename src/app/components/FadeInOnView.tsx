"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  once?: boolean;
  offsetPx?: number;
};

export default function FadeInOnView({
  children,
  className = "",
  delayMs = 0,
  once = true,
  offsetPx = 80,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      {
        root: null,
        rootMargin: `0px 0px -${offsetPx}px 0px`,
        threshold: 0.12,
      }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [once, offsetPx]);

  // Show content during SSR/hydration (mounted=false), animate only after client mount
  const isVisible = !mounted || visible;

  return (
    <div
      ref={ref}
      className={
        "transition-all duration-700 ease-out will-change-transform " +
        (isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3") +
        (className ? ` ${className}` : "")
      }
      style={{ transitionDelay: delayMs ? `${delayMs}ms` : undefined }}
    >
      {children}
    </div>
  );
}
