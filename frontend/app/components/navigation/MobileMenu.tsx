import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { mobileMenuMotion } from "../../lib/animations";
import { ButtonLink } from "../ui/Button";
import { requestAction, studioContact } from "../../data/business";
import type { NavigationItem } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";

type MobileMenuProps = { items: NavigationItem[]; onClose: () => void };

export function MobileMenu({ items, onClose }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = document.getElementById("mobile-menu-trigger");
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      trigger?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="mobile-menu"
      id="mobile-navigation-dialog"
      aria-label="Мобильная навигация"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClose={onClose}
    >
      <motion.div
        className="mobile-menu-content"
        variants={mobileMenuMotion}
        initial={reducedMotion ? false : "hidden"}
        animate="visible"
        transition={reducedMotion ? { duration: 0 } : undefined}
      >
        <div className="mobile-menu-top">
          <span className="wordmark">TIBON</span>
          <button className="icon-button" type="button" aria-label="Закрыть меню" onClick={onClose}>×</button>
        </div>
        <MobileNavigation items={items} onNavigate={onClose} />
        <div className="mobile-menu-actions">
          <a className="header-phone" href={studioContact.phone.href}>Позвонить · {studioContact.phone.label}</a>
          <ButtonLink to={requestAction.to} size="lg" onClick={onClose}>{requestAction.label}</ButtonLink>
        </div>
      </motion.div>
    </dialog>
  );
}
