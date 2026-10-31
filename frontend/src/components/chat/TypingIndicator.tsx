import React from 'react';
import { Mark } from './ChatMessage';

export function TypingIndicator() {
  return (
    <div className="flex gap-3" role="status" aria-live="polite">
      <Mark />
      <div className="flex items-center gap-2 pt-1.5 text-sm text-ink-soft">
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-saffron"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
        Checking the policy documents
      </div>
    </div>
  );
}
