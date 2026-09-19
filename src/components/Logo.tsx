export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`logo ${className}`} aria-label="The Colour Works">
      <span>The Colour Works</span>
      <strong>Manager Coach</strong>
    </div>
  );
}
