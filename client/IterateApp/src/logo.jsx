export default function IterateLogo({ size = 36, spin = true }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={spin ? { animation: "spin 3s linear infinite", animationDirection: 'reverse' } : {}}
    >
      <circle cx="18" cy="18" r="15" stroke="#1A1A1A" strokeWidth="2.5" fill="none" />
      {/* Arrow going clockwise around the circle */}
      <path
        d="M18 3 A15 15 0 1 1 6.5 27"
        stroke="#1A1A1A"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <path
        d="M3.5 24 L6.5 27 L9.5 24"
        stroke="#1A1A1A"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}