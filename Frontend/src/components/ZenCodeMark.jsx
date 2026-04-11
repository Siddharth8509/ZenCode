export default function ZenCodeMark({ className = "h-10 w-10" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="z-top-glow" x1="14" y1="14" x2="52" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8A00" />
          <stop offset="0.45" stopColor="#FF3600" />
          <stop offset="1" stopColor="#B40000" />
        </linearGradient>
        <linearGradient id="z-bottom-glow" x1="12" y1="50" x2="56" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF4D00" />
          <stop offset="0.55" stopColor="#FFB300" />
          <stop offset="1" stopColor="#FFE166" />
        </linearGradient>
        <linearGradient id="z-core" x1="18" y1="17" x2="47" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF4A00" />
          <stop offset="0.5" stopColor="#FF1200" />
          <stop offset="1" stopColor="#C20000" />
        </linearGradient>
      </defs>

      <path
        d="M17 17C24 12 39 12 48 18"
        stroke="url(#z-top-glow)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M14 44C19 53 31 58 44 54C50 52 55 48 57 42"
        stroke="url(#z-bottom-glow)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M19 18H46L24 46H47"
        stroke="url(#z-core)"
        strokeWidth="8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
