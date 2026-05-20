import React from 'react';

interface DeckSelectorProps {
  numDecks: number;
  isHost: boolean;
  onChange: (numDecks: number) => void;
}

const DECK_OPTIONS = [1, 2, 4, 6];

export function DeckSelector({ numDecks, isHost, onChange }: DeckSelectorProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '0.75rem',
      borderRadius: '8px',
      background: 'rgba(255,255,255,0.05)',
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        Number of Decks
      </div>
      <div style={{
        display: 'flex',
        gap: '0.5rem',
      }}>
        {DECK_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => isHost && onChange(option)}
            disabled={!isHost}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: numDecks === option
                ? '2px solid var(--accent-warm)'
                : '2px solid rgba(255,255,255,0.1)',
              background: numDecks === option
                ? 'rgba(255,255,255,0.1)'
                : 'transparent',
              cursor: isHost ? 'pointer' : 'default',
              opacity: isHost ? 1 : 0.6,
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', gap: '-2px' }}>
              {Array.from({ length: option }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '12px',
                    height: '16px',
                    borderRadius: '2px',
                    background: numDecks === option
                      ? 'var(--accent-warm)'
                      : 'rgba(255,255,255,0.3)',
                    marginLeft: i > 0 ? '-4px' : 0,
                    zIndex: i,
                  }}
                />
              ))}
            </div>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: numDecks === option
                ? 'var(--accent-warm)'
                : 'rgba(255,255,255,0.7)',
            }}>
              {option} {option === 1 ? 'Deck' : 'Decks'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
