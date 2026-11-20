import { useEffect, type RefObject } from "react";

export function useEditorialReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!scope.current || typeof IntersectionObserver === "undefined") return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches || typeof entry.target.animate !== "function") continue;

        const animation = entry.target.animate(
          [{ opacity: 0.82, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 560, easing: "cubic-bezier(0.2, 0.65, 0.25, 1)" },
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: 0.16 });

    const cancelAnimations = () => {
      for (const animation of animations) animation.cancel();
      animations.clear();
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
