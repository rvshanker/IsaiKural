import React, { useLayoutEffect, useRef, useState } from 'react';

interface KuralCoupletProps {
  line1: string;
  line2: string;
  /** Largest font size in px; the text only shrinks if a line would not fit. */
  maxPx: number;
  align?: 'center' | 'left';
  className?: string;
}

/**
 * Renders a kural as its two traditional lines — 4 words, then 3 words —
 * never wrapping. If the longest line is wider than the space available
 * (e.g. on a phone), the font shrinks just enough to fit.
 */
export const KuralCouplet: React.FC<KuralCoupletProps> = ({ line1, line2, maxPx, align = 'left', className = '' }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(maxPx);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = () => {
      const lines = Array.from(box.querySelectorAll<HTMLElement>('[data-line]'));
      lines.forEach((l) => (l.style.fontSize = `${maxPx}px`));
      const widest = Math.max(...lines.map((l) => l.getBoundingClientRect().width));
      lines.forEach((l) => (l.style.fontSize = ''));
      const available = box.clientWidth;
      if (!available || !widest) return;
      setSize(widest > available ? Math.floor(((maxPx * available * 0.97) / widest) * 10) / 10 : maxPx);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [line1, line2, maxPx]);

  const line = `block w-max max-w-none whitespace-nowrap ${align === 'center' ? 'mx-auto' : ''}`;

  return (
    <div ref={boxRef} className={`w-full min-w-0 overflow-hidden ${className}`} style={{ fontSize: size, contain: 'inline-size' }}>
      <span data-line className={line}>{line1}</span>
      <span data-line className={line}>{line2}</span>
    </div>
  );
};
