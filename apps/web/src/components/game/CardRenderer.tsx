import React from 'react';

interface CardRendererProps {
  suit: string;
  rank: string;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

const SUIT_COLORS: Record<string, string> = {
  hearts: 'var(--playing-card-red)',
  diamonds: 'var(--playing-card-red)',
  clubs: 'var(--playing-card-black)',
  spades: 'var(--playing-card-black)',
};

const SIZE_MAP = {
  sm: { width: 40, height: 56, rankSize: '0.7rem', suitSize: '0.65rem', centerSuit: '1rem', cornerGap: '0px' },
  md: { width: 56, height: 80, rankSize: '0.875rem', suitSize: '0.75rem', centerSuit: '1.5rem', cornerGap: '0px' },
  lg: { width: 72, height: 100, rankSize: '1.05rem', suitSize: '0.9rem', centerSuit: '2rem', cornerGap: '1px' },
};

export function CardRenderer({ suit, rank, faceDown = false, size = 'md', style }: CardRendererProps) {
  const { width, height, rankSize, suitSize, centerSuit } = SIZE_MAP[size];

  if (faceDown) {
    return (
      <div
        style={{
          width,
          height,
          borderRadius: '6px',
          background: 'var(--card-back-bg)',
          border: '2px solid var(--playing-card-back-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          ...style,
        }}
      >
        <div style={{
          width: width - 12,
          height: height - 12,
          borderRadius: '3px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.20) 3px, rgba(255,255,255,0.20) 6px)',
        }} />
      </div>
    );
  }

  const symbol = SUIT_SYMBOLS[suit] || '?';
  const color = SUIT_COLORS[suit] || 'var(--playing-card-black)';
  const textShadow = 'var(--playing-card-text-outline-shadow)';

  return (
    <div
      style={{
        width,
        height,
        borderRadius: '6px',
        background: 'var(--card-face-bg)',
        border: '2px solid var(--card-face-border)',
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Top-left corner */}
      <div style={{
        position: 'absolute',
        top: '3px',
        left: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1,
        gap: '0px',
      }}>
        <span style={{
          fontSize: rankSize,
          fontWeight: 700,
          color,
          textShadow,
          fontFamily: "'Inter', sans-serif",
        }}>{rank}</span>
        <span style={{
          fontSize: suitSize,
          color,
          textShadow,
          lineHeight: 1,
        }}>{symbol}</span>
      </div>

      {/* Center suit */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: centerSuit,
        color,
        textShadow,
        lineHeight: 1,
      }}>
        {symbol}
      </div>

      {/* Bottom-right corner (rotated) */}
      <div style={{
        position: 'absolute',
        bottom: '3px',
        right: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1,
        gap: '0px',
        transform: 'rotate(180deg)',
      }}>
        <span style={{
          fontSize: rankSize,
          fontWeight: 700,
          color,
          textShadow,
          fontFamily: "'Inter', sans-serif",
        }}>{rank}</span>
        <span style={{
          fontSize: suitSize,
          color,
          textShadow,
          lineHeight: 1,
        }}>{symbol}</span>
      </div>
    </div>
  );
}
