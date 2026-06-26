"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Ne pas afficher sur mobile/tactile
    if (window.matchMedia("(pointer: coarse)").matches) return;

    setVisible(true);
    document.documentElement.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };

    let rafId: number;
    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.13;
      ring.current.y += (pos.current.y - ring.current.y) * 0.13;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 16}px, ${ring.current.y - 16}px)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    // Scale ring on hover interactive elements
    const onEnter = () => ringRef.current?.classList.add("scale-150");
    const onLeave = () => ringRef.current?.classList.remove("scale-150");
    document.querySelectorAll("a, button, [role='button']").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      document.documentElement.style.cursor = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Dot précis */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-[#FF9D3D] rounded-full pointer-events-none z-[9999]"
        style={{ willChange: "transform" }}
      />
      {/* Ring avec lag */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 border-2 border-[#FF9D3D]/60 rounded-full pointer-events-none z-[9998] transition-transform duration-150"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
