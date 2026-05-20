import React from 'react';

interface DeckStackProps {
  numDecks: number;
}

export function DeckStack({ numDecks }: DeckStackProps) {
  const label = `${numDecks} ${numDecks === 1 ? 'Deck' : 'Decks'}`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.25rem',
    }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {Array.from({ length: numDecks }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '24px',
              height: '32px',
              borderRadius: '3px',
              background: 'linear-gradient(135deg, #2a5a3a 0%, #1a3a2a 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              marginLeft: i > 0 ? '-8px' : 0,
              zIndex: i,
            }}
          />
        ))}
      </div>
      <div style={{
        fontSize: '0.625rem',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {label}
      </div>
    </div>
  );
}
