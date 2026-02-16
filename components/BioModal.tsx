"use client";

import { Modal } from "./Modal";

interface BioModalProps {
  open: boolean;
  onClose: () => void;
  text: string;
  personName?: string;
}

export function BioModal({ open, onClose, text, personName }: BioModalProps) {
  const title = personName ? `${personName}'s Biography` : "Biography";

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80 sm:text-base">
        {text}
      </p>
    </Modal>
  );
}
