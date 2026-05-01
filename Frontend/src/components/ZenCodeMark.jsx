export default function ZenCodeMark({ className = "h-10 w-10" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="60" height="60" rx="18" fill="#F8F8F8" />
      <path
        d="M18 17H45C50.5228 17 55 21.4772 55 27C55 29.6522 53.9464 32.1957 52.0711 34.0711L45.1421 41L52.0711 47.9289C53.9464 49.8043 55 52.3478 55 55C55 60.5228 50.5228 65 45 65H18C12.4772 65 8 60.5228 8 55C8 52.3478 9.05357 49.8043 10.9289 47.9289L17.8579 41L10.9289 34.0711C9.05357 32.1957 8 29.6522 8 27C8 21.4772 12.4772 17 18 17Z"
        transform="translate(0 -9)"
        fill="#090909"
      />
      <path
        d="M22 34L31.5 24.5"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M34 45.5L44.5 35"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}
