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
          <stop offset="0" stopColor="#5b9dff" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="spotSpark" x1="27.8" y1="5.8" x2="34.2" y2="12.2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Badge */}
      <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="url(#spotGrad)" />
      <rect x="1.5" y="1.5" width="37" height="17" rx="11" fill="white" fillOpacity="0.08" />

      {/* Pin (Spot) */}
      <path
        d="M20 9c-4.9 0-8.9 3.9-8.9 8.7 0 6.3 7.5 13.1 7.8 13.4a1.5 1.5 0 0 0 2.2 0c.3-.3 7.8-7.1 7.8-13.4C28.9 12.9 24.9 9 20 9Z"
        fill="white"
        fillOpacity="0.18"
      />
      <path
        d="M20 12.6c-2.6 0-4.7 2-4.7 4.6 0 3.3 3.9 6.9 4.1 7a.8.8 0 0 0 1.1 0c.2-.1 4.1-3.7 4.1-7 0-2.6-2.1-4.6-4.6-4.6Z"
        fill="white"
      />

      {/* Star (Review) cut from the pin head */}
      <path
        d="M20 14.1L20.62 15.95L22.57 15.97L21 17.12L21.59 18.98L20 17.85L18.41 18.98L19 17.12L17.43 15.97L19.38 15.95Z"
        fill="url(#spotGrad)"
      />

      {/* Sparkle badge (AI) */}
      <circle cx="31" cy="9" r="7.4" fill="white" />
      <circle cx="31" cy="9" r="6.4" fill="url(#spotSpark)" />
      <path
        d="M31 5.6L31.85 8.15L34.4 9L31.85 9.85L31 12.4L30.15 9.85L27.6 9L30.15 8.15Z"
        fill="white"
      />
    </svg>
  );
}
