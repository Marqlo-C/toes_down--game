export default function CartoonToe() {
  return (
    <svg
      className="cartoon-toe"
      viewBox="0 0 80 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Main toe body */}
      <path
        d="M 25 80 Q 15 70 15 50 Q 15 25 30 15 Q 40 8 40 8 Q 40 8 50 15 Q 65 25 65 50 Q 65 70 55 80 Q 50 85 40 85 Q 30 85 25 80 Z"
        fill="#f5b5a0"
      />

      {/* Toe head - darker/more saturated round top */}
      <ellipse cx="40" cy="25" rx="22" ry="24" fill="#e89880" />

      {/* Toenail - oval shape */}
      <ellipse cx="40" cy="20" rx="13" ry="11" fill="#d97961" />

      {/* Nail shine/highlight */}
      <ellipse cx="37" cy="16" rx="5" ry="4" fill="#ffd4c0" opacity={0.9} />

      {/* Toe wrinkles/definition lines */}
      <path d="M 22 50 Q 40 48 58 50" stroke="#d0907a" strokeWidth="0.8" fill="none" opacity={0.4} />
      <path d="M 20 65 Q 40 67 60 65" stroke="#d0907a" strokeWidth="0.8" fill="none" opacity={0.3} />

      {/* Excitement lines above - radiating */}
      <line x1="40" y1="2" x2="40" y2="-6" stroke="#c9514a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="53" y1="6" x2="62" y2="-1" stroke="#c9514a" strokeWidth="2" strokeLinecap="round" />
      <line x1="27" y1="6" x2="18" y2="-1" stroke="#c9514a" strokeWidth="2" strokeLinecap="round" />
      <line x1="62" y1="15" x2="72" y2="8" stroke="#c9514a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="15" x2="8" y2="8" stroke="#c9514a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
