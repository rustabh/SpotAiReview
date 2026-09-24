export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="spotGrad" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4f8bff" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="url(#spotGrad)" />
      <path
        d="M20 9c-4.6 0-8.3 3.6-8.3 8.1 0 5.9 7 12.3 7.3 12.6a1.4 1.4 0 0 0 2 0c.3-.3 7.3-6.7 7.3-12.6C28.3 12.6 24.6 9 20 9Z"
        fill="white"
        fillOpacity="0.16"
      />
      <path
        d="M20 12.6c-2.6 0-4.7 2-4.7 4.6 0 3.3 3.9 6.9 4.1 7a.8.8 0 0 0 1.1 0c.2-.1 4.1-3.7 4.1-7 0-2.6-2.1-4.6-4.6-4.6Z"
        fill="white"
      />
      <circle cx="20" cy="17.1" r="1.7" fill="url(#spotGrad)" />
    </svg>
  );
}
