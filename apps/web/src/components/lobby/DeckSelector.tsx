import React from 'react';

interface DeckSelectorProps {
  numDecks: number;
  isHost: boolean;
  onChange: (numDecks: number) => void;
}

const DECK_OPTIONS = [1, 2, 4, 6];

export function DeckSelector({ numDecks, isHost, onChange }: DeckSelectorProps) {
  return (
    <div className="bj-deck-selector" style={{
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
        {DECK_OPTIONS.map((option) => {
          const selected = numDecks === option;
          return (
            <button
              key={option}
              className={`bj-deck-selector__option${selected ? ' is-selected' : ''}`}
              onClick={() => isHost && onChange(option)}
              disabled={!isHost}
              type="button"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: '14px',
                border: selected
                  ? '2px solid var(--accent-warm)'
                  : '1px solid rgba(255,255,255,0.14)',
                background: selected
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(255,255,255,0.03)',
                cursor: isHost ? 'pointer' : 'default',
                opacity: isHost ? 1 : 0.65,
                transition: 'all 0.2s ease',
              }}
            >
              <div className="bj-deck-selector__swatches" aria-hidden="true">
                {Array.from({ length: option }).map((_, i) => (
                  <span
                    key={i}
                    className={`bj-deck-selector__swatch${selected ? ' is-selected' : ''}`}
                    style={{
                      background: selected
                        ? 'var(--accent-warm)'
                        : 'rgba(255,255,255,0.50)',
                    }}
                  />
                ))}
              </div>
              <div className="bj-deck-selector__count" style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: selected ? 'var(--accent-warm)' : 'var(--text-primary)',
                lineHeight: 1,
              }}>
                {option}
              </div>
              <div className="bj-deck-selector__label" style={{
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                lineHeight: 1,
              }}>
                {option === 1 ? 'Deck' : 'Decks'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
