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
      gap: '0.75rem',
      padding: '0.875rem',
      borderRadius: '14px',
      background: 'rgba(255,255,255,0.05)',
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        Number of Decks
      </div>
      <div className="bj-deck-selector__options">
        {DECK_OPTIONS.map((option) => (
          <button
            key={option}
            className="bj-deck-selector__option"
            onClick={() => isHost && onChange(option)}
            disabled={!isHost}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.45rem',
              borderRadius: '12px',
              border: numDecks === option
                ? '2px solid var(--accent-warm)'
                : '1px solid rgba(255,255,255,0.14)',
              background: numDecks === option
                ? 'rgba(255,255,255,0.12)'
                : 'rgba(255,255,255,0.03)',
              cursor: isHost ? 'pointer' : 'default',
              opacity: isHost ? 1 : 0.65,
              transition: 'all 0.2s ease',
            }}
          >
            <div className="bj-deck-selector__swatches">
              {Array.from({ length: option }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '12px',
                    height: '16px',
                    borderRadius: '3px',
                    background: numDecks === option
                      ? 'var(--accent-warm)'
                      : 'rgba(255,255,255,0.38)',
                    marginLeft: i > 0 ? '-4px' : 0,
                    zIndex: i,
                    border: '1px solid rgba(255,255,255,0.16)',
                  }}
                />
              ))}
            </div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: numDecks === option
                ? 'var(--accent-warm)'
                : 'var(--text-primary)',
            }}>
              {option}
            </div>
            <div style={{
              fontSize: '0.68rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {option === 1 ? 'Deck' : 'Decks'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
