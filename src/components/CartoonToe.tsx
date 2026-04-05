export default function CartoonToe() {
  return (
    <svg
      className="cartoon-toe"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Toe shape - main body */}
      <ellipse cx="45" cy="55" rx="28" ry="32" fill="#f4b3a0" />
      
      {/* Toe shape - rounded top */}
      <circle cx="45" cy="20" r="22" fill="#f4a89a" />
      
      {/* Toenail */}
      <ellipse cx="45" cy="18" rx="12" ry="9" fill="#e89984" />
      <ellipse cx="45" cy="16" rx="10" ry="7" fill="#f5a89a" />
      
      {/* Highlight/shine on toenail */}
      <ellipse cx="41" cy="14" rx="4" ry="3" fill="#ffd4c0" opacity="0.7" />
      
      {/* Direction lines above toe (animated look) */}
      <line x1="45" y1="0" x2="45" y2="5" stroke="#d97961" strokeWidth="2" strokeLinecap="round" />
      <line x1="55" y1="3" x2="60" y2="8" stroke="#d97961" strokeWidth="2" strokeLinecap="round" />
      <line x1="35" y1="3" x2="30" y2="8" stroke="#d97961" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="8" x2="72" y2="12" stroke="#d97961" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="25" y1="8" x2="18" y2="12" stroke="#d97961" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Joint/knuckle lines */}
      <path d="M 20 50 Q 45 48 70 50" stroke="#e0a090" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M 25 70 Q 45 72 65 70" stroke="#e0a090" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}
