/** Decorative curved seam dropped between two full-width sections. */
export function WaveDivider({
  color,
  flip = false,
}: {
  /** Text-color utility matching the section this wave visually belongs to. */
  color: string;
  flip?: boolean;
}) {
  return (
    <div aria-hidden className={`-my-px block ${color}`}>
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className={`block h-6 w-full sm:h-10 ${flip ? "rotate-180" : ""}`}
      >
        <path
          d="M0,32 C240,58 480,4 720,18 C960,32 1200,58 1440,20 L1440,48 L0,48 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
