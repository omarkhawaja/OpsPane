export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* antennae */}
      <path
        d="M11 8 L8 4.5 M21 8 L24 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* head */}
      <circle cx="16" cy="9.5" r="3" fill="currentColor" />
      {/* body */}
      <rect x="10" y="13" width="12" height="13" rx="6" fill="currentColor" />
      {/* spine line, like a debug breakpoint stripe */}
      <rect x="15" y="14.5" width="2" height="10" rx="1" fill="var(--background)" />
      {/* legs */}
      <path
        d="M10 16.5 H5 M10 19.5 H4.5 M10 22.5 H5 M22 16.5 H27 M22 19.5 H27.5 M22 22.5 H27"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
