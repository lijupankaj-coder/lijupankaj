"use client";

import { useEffect } from "react";

const shiftProperty = "--parallax-y";

export function ParallaxController() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion.matches) {
        elements.forEach((element) => element.style.removeProperty(shiftProperty));
        return;
      }

      const viewportCenter = window.innerHeight / 2;
      const mobileFactor = window.innerWidth <= 620 ? 0.55 : 1;

      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const currentShift = Number.parseFloat(element.style.getPropertyValue(shiftProperty)) || 0;
        const layoutCenter = rect.top + rect.height / 2 - currentShift;
        const speed = Number(element.dataset.parallaxSpeed ?? 0.03) * mobileFactor;
        const limit = Number(element.dataset.parallaxMax ?? 32) * mobileFactor;
        const nextShift = Math.max(-limit, Math.min(limit, (layoutCenter - viewportCenter) * speed));
        element.style.setProperty(shiftProperty, `${nextShift.toFixed(2)}px`);
      });
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.documentElement);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
      elements.forEach((element) => element.style.removeProperty(shiftProperty));
    };
  }, []);

  return null;
}
