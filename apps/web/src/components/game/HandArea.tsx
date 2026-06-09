import React from 'react';
import { CardRenderer } from './CardRenderer.js';
import { handValue, isSoft } from '@blackjack/game-core';

interface Card {
  suit: string;
  rank: string;
  id: string;
}

interface HandAreaProps {
  cards: Card[];
  bet: number;
  status: string;
  isActive?: boolean;
  showCards?: boolean;
  label?: string;
  style?: React.CSSProperties;
}

function getHandDisplay(cards: Card[]): string {
  if (cards.length === 0) return '';
  // Build proper Card objects for handValue
  const typedCards = cards.map(c => ({ suit: c.suit as any, rank: c.rank as any, id: c.id }));
  const val = handValue(typedCards);
  const soft = isSoft(typedCards);

  if (val.isBlackjack) return '21';
  if (val.soft > 21) return `${val.soft}`;

  // If soft hand and soft !== hard, show both values
  if (soft && val.soft !== val.hard) {
    return `${val.soft} or ${val.hard}`;
  }

  return `${val.soft}`;
}

export function HandArea({ cards, bet, status, isActive = false, showCards = true, label, style }: HandAreaProps) {
  const displayStatus = () => {
    switch (status) {
      case 'blackjack': return { text: 'BLACKJACK!', color: '#c4a040' };
      case 'bust': return { text: 'BUST', color: 'var(--danger)' };
      case 'standing': return { text: 'STAND', color: 'var(--text-secondary)' };
      case 'surrender': return { text: 'SURRENDER', color: 'var(--danger)' };
      default: return null;
    }
  };

  const statusInfo = displayStatus();
  const handDisplay = showCards ? getHandDisplay(cards) : '';

  return (
    <div className={isActive ? 'bj-hand-panel bj-hand-panel--active' : 'bj-hand-panel'} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.375rem',
      padding: '0.5rem',
      borderRadius: '12px',
      border: isActive ? '2px solid var(--accent-warm)' : '2px solid transparent',
      transition: 'all 150ms ease',
      animation: isActive ? 'activeGlow 1.5s ease-in-out infinite' : 'none',
      ...style,
    }}>
      {label && (
        <div style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {label}
        </div>
      )}

      {/* Hand value */}
      {handDisplay && (
        <div style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: 'var(--accent-warm)',
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.02em',
        }}>
          {handDisplay}
        </div>
      )}

      {/* Cards */}
      <div style={{
        display: 'flex',
        position: 'relative',
        minHeight: '80px',
      }}>
        {cards.length === 0 ? (
          <div style={{
            width: 56,
            height: 80,
            borderRadius: '6px',
            border: '2px dashed var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.625rem',
          }}>
            --
          </div>
        ) : cards.map((card, i) => (
          <div
            key={card.id}
            style={{
              marginLeft: i > 0 ? '-16px' : '0',
              zIndex: i,
              animation: `slideInCard 0.3s ease-out ${i * 0.1}s both`,
            }}
          >
            <CardRenderer
              suit={showCards ? card.suit : 'back'}
              rank={showCards ? card.rank : 'back'}
              faceDown={!showCards}
              size="md"
            />
          </div>
        ))}
      </div>

      {/* Bet */}
      {bet > 0 && (
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          animation: 'chipBounce 0.3s ease-out',
        }}>
          ${bet}
        </div>
      )}

      {/* Status */}
      {statusInfo && (
        <div style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: statusInfo.color,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          {statusInfo.text}
        </div>
      )}
    </div>
  );
}
