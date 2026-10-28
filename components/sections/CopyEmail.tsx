'use client';

import { useRef, useState } from 'react';

/** Shows the email address with a button that copies it, falling back to selecting the text. */
export function CopyEmail({ email }: { email: string }) {
  const [label, setLabel] = useState('Copy email');
  const textRef = useRef<HTMLSpanElement>(null);

  const flash = (msg: string) => {
    setLabel(msg);
    setTimeout(() => setLabel('Copy email'), 1800);
  };
  const selectText = () => {
    const range = document.createRange();
    range.selectNodeContents(textRef.current!);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    flash('Selected, press Ctrl+C');
  };
  const copy = () => {
    if (!navigator.clipboard) return selectText();
    navigator.clipboard.writeText(email).then(() => flash('Copied'), selectText);
  };

  return (
    <div className="email-row">
      <span className="email" ref={textRef}>
        {email}
      </span>
      <button className="btn primary" onClick={copy}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <rect x="5" y="5" width="8.5" height="8.5" rx="1.8" />
          <path d="M10.5 5V3.8A1.3 1.3 0 0 0 9.2 2.5H3.8A1.3 1.3 0 0 0 2.5 3.8v5.4a1.3 1.3 0 0 0 1.3 1.3H5" />
        </svg>
        <span>{label}</span>
      </button>
    </div>
  );
}
