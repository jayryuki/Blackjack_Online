import React, { useState, useEffect } from 'react';
import { Button } from '@games/ui';
import { ChipRenderer } from './ChipRenderer.js';

interface BetControlsProps {
  minBet: number;
  maxBet: number;
  bankroll: number;
  onPlaceBet: (amount: number) => void;
  initialBet?: number;
}

const CHIP_VALUES = [5, 10, 25, 50, 100];

export function BetControls({ minBet, maxBet, bankroll, onPlaceBet, initialBet }: BetControlsProps) {
  const [betAmount, setBetAmount] = useState(initialBet ?? minBet);

  useEffect(() => {
    setBetAmount(initialBet ?? minBet);
  }, [initialBet, minBet]);

  const addChip = (value: number) => {
    setBetAmount((prev) => Math.min(prev + value, maxBet, bankroll));
  };

  const clearBet = () => setBetAmount(0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '1.5rem',
      borderRadius: '16px',
      background: 'var(--surface-panel)',
      border: '1px solid var(--border-subtle)',
      animation: 'fadeInUp 0.3s ease-out',
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        Place Your Bet
      </div>

      {/* Current bet display */}
      <div style={{
        fontSize: '2rem',
        fontWeight: 700,
        color: 'var(--accent-warm)',
        fontFamily: "'Inter', sans-serif",
      }}>
        ${betAmount}
      </div>

      {/* Chip buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {CHIP_VALUES.map((value) => (
          <button
            key={value}
            onClick={() => addChip(value)}
            disabled={betAmount + value > maxBet || betAmount + value > bankroll}
            style={{
              background: 'none',
              border: 'none',
              cursor: betAmount + value > maxBet || betAmount + value > bankroll ? 'not-allowed' : 'pointer',
              opacity: betAmount + value > maxBet || betAmount + value > bankroll ? 0.4 : 1,
              transition: 'transform 120ms ease',
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ChipRenderer value={value} />
          </button>
        ))}
      </div>

      {/* Quick bet buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button size="sm" variant="ghost" onClick={() => setBetAmount(minBet)}>
          Min
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setBetAmount(Math.min(Math.floor(bankroll / 2), maxBet))}>
          Half
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setBetAmount(Math.min(bankroll, maxBet))}>
          Max
        </Button>
        <Button size="sm" variant="ghost" onClick={clearBet}>
          Clear
        </Button>
      </div>

      {/* Place bet button */}
      <Button
        size="lg"
        onClick={() => onPlaceBet(betAmount)}
        disabled={betAmount < minBet || betAmount > bankroll}
        style={{ width: '100%', maxWidth: '300px' }}
      >
        Place Bet (${betAmount})
      </Button>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Bankroll: ${bankroll} | Min: ${minBet} | Max: ${maxBet}
      </div>
    </div>
  );
}
