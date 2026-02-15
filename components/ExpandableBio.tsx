"use client";

import { useState } from "react";

interface ExpandableBioProps {
  text: string;
}

export function ExpandableBio({ text }: ExpandableBioProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p
        className={`max-w-2xl text-sm leading-relaxed text-foreground/80 ${
          expanded ? "" : "line-clamp-4 sm:line-clamp-6"
        }`}
      >
        {text}
      </p>
      {text.length > 200 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-sm text-accent hover:text-accent-hover"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
