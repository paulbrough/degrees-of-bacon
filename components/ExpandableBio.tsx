"use client";

import { useState } from "react";
import { BioModal } from "./BioModal";

interface ExpandableBioProps {
  text: string;
  personName?: string;
}

export function ExpandableBio({ text, personName }: ExpandableBioProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <p className="line-clamp-4 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:line-clamp-6">
        {text}
      </p>
      {text.length > 200 && (
        <button
          onClick={() => setModalOpen(true)}
          className="mt-1 text-sm text-accent hover:text-accent-hover"
        >
          Read more
        </button>
      )}
      <BioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        text={text}
        personName={personName}
      />
    </div>
  );
}
