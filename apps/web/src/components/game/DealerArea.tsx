import React from 'react';
import { CardRenderer } from './CardRenderer.js';
import { handValue, isSoft } from '@blackjack/game-core';

interface Card {
  suit: string;
  rank: string;
  id: string;
}

interface DealerAreaProps {
  cards: Card[];
  status: string;
}

function getDealerDisplay(cards: Card[]): string {
  if (cards.length === 0) return '';
  const visibleCards = cards.filter(c => c.suit !== 'back');
  if (visibleCards.length === 0) return '';
  const typedCards = visibleCards.map(c => ({ suit: c.suit as any, rank: c.rank as any, id: c.id }));
  const val = handValue(typedCards);
  const soft = isSoft(typedCards);

  if (val.isBlackjack) return '21';
  if (val.soft > 21) return `${val.soft}`;

  if (soft && val.soft !== val.hard) {
    return `${val.soft} or ${val.hard}`;
  }

  return `${val.soft}`;
}

export function DealerArea({ cards, status }: DealerAreaProps) {
  const showAll = status === 'revealed';
  const display = showAll ? getDealerDisplay(cards) : '';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1rem',
      borderRadius: '16px',
      background: 'rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        Dealer
        {display && (
          <span style={{ marginLeft: '0.5rem', color: 'var(--accent-warm)', fontWeight: 700 }}>
            {display}
          </span>
        )}
      </div>

      <div style={{
        display: 'flex',
        position: 'relative',
        minHeight: '100px',
      }}>
        {cards.length === 0 ? (
          <div style={{
            width: 72,
            height: 100,
            borderRadius: '6px',
            border: '2px dashed var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
          }}>
            Dealer
          </div>
        ) : cards.map((card, i) => (
          <div
            key={card.id}
            style={{
              marginLeft: i > 0 ? '-20px' : '0',
              zIndex: i,
              animation: `slideInCard 0.3s ease-out ${i * 0.15}s both`,
            }}
          >
            <CardRenderer
              suit={card.suit}
              rank={card.rank}
              faceDown={card.suit === 'back'}
              size="lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
