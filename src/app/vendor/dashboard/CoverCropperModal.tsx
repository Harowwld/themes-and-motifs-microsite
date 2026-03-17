"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  imageUrl: string;
  initialFocusX: number;
  initialFocusY: number;
  initialZoom: number;
  minZoom?: number;
  maxZoom?: number;
  onCancel: () => void;
  onSave: (next: { focusX: number; focusY: number; zoom: number }) => void;
};

function clamp(v: number, min: number, max: number) {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

export default function CoverCropperModal({
  open,
  imageUrl,
  initialFocusX,
  initialFocusY,
  initialZoom,
  minZoom = 1,
  maxZoom = 3,
  onCancel,
  onSave,
}: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const focusXRef = useRef(50);
  const focusYRef = useRef(50);
  const zoomRef = useRef(1);

  const [focusX, setFocusX] = useState(() => clamp(initialFocusX, 0, 100));
  const [focusY, setFocusY] = useState(() => clamp(initialFocusY, 0, 100));
  const [zoom, setZoom] = useState(() => clamp(initialZoom, minZoom, maxZoom));

  useEffect(() => {
    focusXRef.current = focusX;
  }, [focusX]);

  useEffect(() => {
    focusYRef.current = focusY;
  }, [focusY]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    if (!open) return;
    setFocusX(clamp(initialFocusX, 0, 100));
    setFocusY(clamp(initialFocusY, 0, 100));
    setZoom(clamp(initialZoom, minZoom, maxZoom));
  }, [open, initialFocusX, initialFocusY, initialZoom, minZoom, maxZoom]);

  const transformOrigin = useMemo(() => `${focusX}% ${focusY}%`, [focusX, focusY]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) return;
    const el = viewportRef.current;
    if (!el) return;

    const drag = {
      active: false,
      startX: 0,
      startY: 0,
      baseFocusX: 50,
      baseFocusY: 50,
    };

    const onPointerDown = (e: PointerEvent) => {
      drag.active = true;
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.baseFocusX = focusXRef.current;
      drag.baseFocusY = focusYRef.current;

      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.active) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      const z = zoomRef.current;
      // Convert pointer delta to an object-position percentage delta.
      // Higher zoom should make the same drag move the frame less (more precise).
      const denomX = Math.max(1, rect.width * z);
      const denomY = Math.max(1, rect.height * z);
      const nextX = drag.baseFocusX - (dx / denomX) * 100;
      const nextY = drag.baseFocusY - (dy / denomY) * 100;

      setFocusX(clamp(nextX, 0, 100));
      setFocusY(clamp(nextY, 0, 100));
    };

    const onPointerUp = () => {
      drag.active = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      const step = 0.08;
      setZoom((z) => clamp(z + (delta > 0 ? -step : step), minZoom, maxZoom));
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("wheel", onWheel as any);
    };
  }, [open, minZoom, maxZoom]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-black/10">
            <div className="text-[14px] font-semibold text-[#2c2c2c]">Adjust cover</div>
            <div className="mt-1 text-[12px] text-black/55">
              Drag to reposition. Scroll or use +/- to zoom.
            </div>
          </div>

          <div className="p-5 grid gap-4">
            <div className="flex justify-center">
              <div
                ref={viewportRef}
                className="relative w-full max-w-[360px] h-[154px] rounded-[6px] border border-black/20 bg-[#f3f4f6] overflow-hidden cursor-grab active:cursor-grabbing"
              >
                <img
                  src={imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover select-none"
                  style={{ transformOrigin, transform: `scale(${zoom})` }}
                  draggable={false}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  className="h-9 w-9 rounded-[6px] border border-black/15 bg-white text-[16px] font-semibold text-black/70 hover:bg-black/[0.02]"
                  onClick={() => setZoom((z) => clamp(z - 0.1, minZoom, maxZoom))}
                  aria-label="Zoom out"
                >
                  -
                </button>
                <div className="text-[12px] font-semibold text-black/60 min-w-16 text-center">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  type="button"
                  className="h-9 w-9 rounded-[6px] border border-black/15 bg-white text-[16px] font-semibold text-black/70 hover:bg-black/[0.02]"
                  onClick={() => setZoom((z) => clamp(z + 0.1, minZoom, maxZoom))}
                  aria-label="Zoom in"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-9 px-3 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02]"
                  onClick={() => {
                    setFocusX(50);
                    setFocusY(50);
                    setZoom(1);
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="h-9 px-4 rounded-[6px] bg-[#a67c52] text-white text-[12px] font-semibold hover:bg-[#8e6a46]"
                  onClick={() => onSave({ focusX, focusY, zoom })}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
