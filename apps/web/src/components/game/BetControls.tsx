import React, { useState, useEffect } from 'react';
import { Button } from '@games/ui';
import { ChipRenderer } from './ChipRenderer.js';
import { playSound } from '../../lib/sounds.js';

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
    playSound('chip');
    setBetAmount((prev) => Math.min(prev + value, maxBet, bankroll));
  };

  const clearBet = () => setBetAmount(0);

  return (
    <div className="bj-bet-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '1.25rem',
      borderRadius: '18px',
      background: 'var(--surface-panel)',
      border: '1px solid var(--border-subtle)',
      animation: 'fadeInUp 0.3s ease-out',
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        Place Your Bet
      </div>

      <div style={{
        fontSize: '2rem',
        fontWeight: 800,
        color: 'var(--accent-warm)',
        fontFamily: "'Inter', sans-serif",
      }}>
        ${betAmount}
      </div>

      <div className="bj-bet-panel__chips">
        {CHIP_VALUES.map((value) => (
          <button
            key={value}
            onClick={() => addChip(value)}
            disabled={betAmount + value > maxBet || betAmount + value > bankroll}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '14px',
              cursor: betAmount + value > maxBet || betAmount + value > bankroll ? 'not-allowed' : 'pointer',
              opacity: betAmount + value > maxBet || betAmount + value > bankroll ? 0.4 : 1,
              transition: 'transform 120ms ease',
              padding: '0.55rem 0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ChipRenderer value={value} />
          </button>
        ))}
      </div>

      <div className="bj-bet-panel__quick">
        <Button size="sm" variant="ghost" onClick={() => setBetAmount(minBet)}>Min</Button>
        <Button size="sm" variant="ghost" onClick={() => setBetAmount(Math.min(Math.floor(bankroll / 2), maxBet))}>Half</Button>
        <Button size="sm" variant="ghost" onClick={() => setBetAmount(Math.min(bankroll, maxBet))}>Max</Button>
        <Button size="sm" variant="ghost" onClick={clearBet}>Clear</Button>
      </div>

      <Button
        size="lg"
        onClick={() => onPlaceBet(betAmount)}
        disabled={betAmount < minBet || betAmount > bankroll}
        style={{ width: '100%', maxWidth: '320px', margin: '0 auto' }}
      >
        Place Bet (${betAmount})
      </Button>

      <div className="bj-bet-panel__summary" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <div>Bankroll: ${bankroll}</div>
        <div>Min: ${minBet} · Max: ${maxBet}</div>
      </div>
    </div>
  );
}
