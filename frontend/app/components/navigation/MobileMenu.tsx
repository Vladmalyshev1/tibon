import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router";
import { mobileMenuMotion } from "../../lib/animations";
import { BrandMark } from "../ui/BrandMark";
import { studioContact } from "../../data/business";
import type { NavigationItem } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";

type MobileMenuProps = { items: readonly NavigationItem[]; onClose: () => void };

export function MobileMenu({ items, onClose }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = document.getElementById("mobile-menu-trigger");
    const headerBrand = document.querySelector<HTMLAnchorElement>(".site-header .brand-mark");
    const isDesktop = () => trigger && getComputedStyle(trigger).display === "none";
    const closeOnDesktop = () => { if (isDesktop()) onClose(); };
    window.addEventListener("resize", closeOnDesktop);
    document.body.style.overflow = "hidden";
    dialog.showModal();
    dialog.querySelector("button")?.focus();
    return () => {
      window.removeEventListener("resize", closeOnDesktop);
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      (isDesktop() ? headerBrand : trigger)?.focus({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="mobile-menu"
      id="mobile-navigation-dialog"
      aria-label="Мобильная навигация"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClose={(event) => { if (!event.currentTarget.open) onClose(); }}
    >
      <motion.div
        className="mobile-menu-content"
        variants={mobileMenuMotion}
        initial={reducedMotion ? false : "hidden"}
        animate="visible"
        transition={reducedMotion ? { duration: 0 } : undefined}
      >
        <div className="mobile-menu-top">
          <Link className="brand-mark" to="/" aria-label="TIBON — главная" onClick={onClose}><BrandMark /></Link>
          <button className="icon-button" type="button" aria-label="Закрыть меню" onClick={onClose}>×</button>
        </div>
        <MobileNavigation items={items} onNavigate={onClose} />
        <div className="mobile-menu-actions">
          <a className="header-phone" href={studioContact.phone.href}>Позвонить · {studioContact.phone.label}</a>
        </div>
      </motion.div>
    </dialog>
  );
}
