"use client";

import { useEffect } from "react";

const shiftProperty = "--parallax-y";

export function ParallaxController() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>("[data-section-reveal]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealTimers = new Set<number>();
    let frame = 0;

    const reveal = (element: HTMLElement) => {
      element.classList.remove("reveal-pending");
      if (reducedMotion.matches) {
        element.classList.remove("is-revealed");
        return;
      }
      element.classList.add("is-revealed");
      const timer = window.setTimeout(() => {
        element.classList.remove("is-revealed");
        revealTimers.delete(timer);
      }, 1050);
      revealTimers.add(timer);
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target as HTMLElement);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });

    if (reducedMotion.matches) {
      revealElements.forEach(reveal);
    } else {
      revealElements.forEach((element) => {
        element.classList.add("reveal-pending");
        if (element.getBoundingClientRect().top <= window.innerHeight * 0.92) {
          window.requestAnimationFrame(() => reveal(element));
        } else {
          revealObserver.observe(element);
        }
      });
    }

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

    const syncMotionPreference = () => {
      if (reducedMotion.matches) {
        revealObserver.disconnect();
        revealTimers.forEach((timer) => window.clearTimeout(timer));
        revealTimers.clear();
        revealElements.forEach(reveal);
      }
      schedule();
    };

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.documentElement);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", syncMotionPreference);
    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      revealTimers.forEach((timer) => window.clearTimeout(timer));
      revealObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", syncMotionPreference);
      elements.forEach((element) => element.style.removeProperty(shiftProperty));
      revealElements.forEach((element) => element.classList.remove("reveal-pending", "is-revealed"));
    };
  }, []);

  return null;
}
