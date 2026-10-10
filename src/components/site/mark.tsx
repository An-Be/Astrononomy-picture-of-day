// Brand mark: a planet on a tilted orbit.
// Inline SVG with currentColor so it inherits text color (next/image can't).
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="7" fill="currentColor" stroke="none" />
      <ellipse cx="16" cy="16" rx="14" ry="5" strokeWidth="2" transform="rotate(-24 16 16)" />
    </svg>
  );
}
