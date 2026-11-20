import { useEffect, useId, useRef, type KeyboardEventHandler, type ReactNode } from "react";
import { IconButton } from "./IconButton";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement>;
};

export function Modal({ open, title, onClose, children, onKeyDown }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="modal-panel">
        <div className="modal-heading">
          <h2 id={titleId} className="type-h3">{title}</h2>
          <IconButton label="Закрыть окно" onClick={() => dialogRef.current?.close()}>×</IconButton>
        </div>
        {children}
      </div>
    </dialog>
  );
}
