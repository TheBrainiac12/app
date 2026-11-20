import { useId } from "react";

const TEXT = {
  approved: { top: "RENT APPROVED", bottom: "GLOBAL EDITION" },
  denied: { top: "ENTRY DENIED", bottom: "REALITY CHECK" },
};

const MONO = "'JetBrains Mono', monospace";

export const PassportStamp = ({ variant = "approved", accentColor = "#10E39A", size = 200, opacity = 0.75, rotate = -12, style, testId = "passport-stamp" }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const t = TEXT[variant];
  const top = `stamp-top-${uid}`;
  const bottom = `stamp-bottom-${uid}`;
  return (
    <svg
      data-testid={testId}
      data-variant={variant}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ transform: `rotate(${rotate}deg)`, pointerEvents: "none", flexShrink: 0, opacity, ...style }}
    >
      <defs>
        <path id={top} d="M 28 100 A 72 72 0 0 1 172 100" />
        <path id={bottom} d="M 22 100 A 78 78 0 0 0 178 100" />
      </defs>
      <circle cx="100" cy="100" r="95" fill="none" stroke={accentColor} strokeWidth="5" />
      <circle cx="100" cy="100" r="87" fill="none" stroke={accentColor} strokeWidth="1.6" />
      <circle cx="100" cy="100" r="58" fill="none" stroke={accentColor} strokeWidth="1.6" strokeDasharray="4 4" />
      <text fill={accentColor} fontFamily={MONO} fontSize="15" fontWeight="700" letterSpacing="3">
        <textPath href={`#${top}`} startOffset="50%" textAnchor="middle">{t.top}</textPath>
      </text>
      <text fill={accentColor} fontFamily={MONO} fontSize="13" fontWeight="700" letterSpacing="3">
        <textPath href={`#${bottom}`} startOffset="50%" textAnchor="middle" dominantBaseline="hanging">{t.bottom}</textPath>
      </text>
      <circle cx="30" cy="100" r="3" fill={accentColor} />
      <circle cx="170" cy="100" r="3" fill={accentColor} />
      <rect x="18" y="86" width="164" height="30" fill="none" stroke={accentColor} strokeWidth="2.5" />
      <text x="100" y="108" textAnchor="middle" fill={accentColor} fontFamily={MONO} fontSize="21" fontWeight="800" letterSpacing="2">
        ELSEWHERE
      </text>
      <path
        transform="translate(100 66) rotate(45) translate(-10 -10)"
        fill={accentColor}
        d="M10 0c1 0 1.6.9 1.6 2v5.2l7.6 4.5v2l-7.6-2.3v4.2l2.2 1.6v1.6L10 17.8l-3.8 1V17.2l2.2-1.6v-4.2L.8 13.7v-2l7.6-4.5V2c0-1.1.6-2 1.6-2z"
      />
      <path
        transform="translate(100 136)"
        fill="none"
        stroke={accentColor}
        strokeWidth="1.6"
        d="M-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M-9 0h18M0 -9c-4 4-4 14 0 18M0 -9c4 4 4 14 0 18"
      />
    </svg>
  );
};
