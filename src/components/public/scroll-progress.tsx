"use client";

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY || document.documentElement.scrollTop;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, current / scrollable)) : 0;
      indicatorRef.current?.style.setProperty("--scroll-progress", progress.toFixed(4));
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.documentElement);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return <div className="scroll-progress" aria-hidden="true"><span ref={indicatorRef} /></div>;
}
