import { useEffect, type RefObject } from "react";
import { animate, type AnimationPlaybackControls } from "framer-motion";

export function useEditorialReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!scope.current || typeof IntersectionObserver === "undefined") return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Map<HTMLElement, AnimationPlaybackControls>();
    const reset = (element: HTMLElement) => {
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
      animations.delete(element);
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches || !(entry.target instanceof HTMLElement)) continue;

        const element = entry.target;
        const animation = animate(
          element,
          { opacity: [0.82, 1], y: [12, 0] },
          {
            delay: Number(element.dataset.editorialReveal ?? 0) / 1000 || 0,
            duration: 0.52,
            ease: [0.2, 0.65, 0.25, 1],
            onComplete: () => reset(element),
          },
        );
        animations.set(element, animation);
      }
    }, { threshold: 0.16 });

    const cancelAnimations = () => {
      for (const [element, animation] of animations) {
        animation.stop();
        reset(element);
      }
    };

    scope.current.querySelectorAll("[data-editorial-reveal]").forEach((element) => observer.observe(element));
    preference.addEventListener("change", cancelAnimations);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", cancelAnimations);
      cancelAnimations();
    };
  }, [scope]);
}
