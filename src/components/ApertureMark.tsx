export const ApertureMark = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="24" cy="24" r="3" fill="currentColor" />
    {[0, 60, 120, 180, 240, 300].map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const rad2 = ((deg + 150) * Math.PI) / 180;
      const x1 = 24 + Math.cos(rad) * 20;
      const y1 = 24 + Math.sin(rad) * 20;
      const x2 = 24 + Math.cos(rad2) * 20;
      const y2 = 24 + Math.sin(rad2) * 20;
      return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />;
    })}
  </svg>
);
