// Brand mark: a planet rising inside a picture frame, with one star.
// Same drawing as src/app/icon.svg (the favicon); keep the two in sync.
// Inline SVG with currentColor so it inherits text color (next/image can't).
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="3" y="3" width="26" height="26" strokeWidth="2" />
      <path d="M12 29 A11 11 0 0 1 29 15 L29 29 Z" fill="currentColor" stroke="none" />
      <circle cx="10" cy="10" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
