import React from 'react';

interface PlayerListProps {
  players: Array<{ playerId: string; displayName: string; isConnected: boolean; isReady: boolean; bankroll?: number }>;
  isHost?: boolean;
  myPlayerId?: string;
  onKick?: (playerId: string) => void;
}

export function PlayerList({ players, isHost, myPlayerId, onKick }: PlayerListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {players.map((p, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          background: 'var(--surface-panel)',
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: p.isConnected ? 'var(--success)' : 'var(--text-muted)',
          }} />
          <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{p.displayName}</span>
          {p.bankroll !== undefined && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>${p.bankroll}</span>
          )}
          {p.isReady && <span style={{ fontSize: '0.6875rem', color: 'var(--success)', fontWeight: 500 }}>Ready</span>}
          {isHost && p.playerId !== myPlayerId && onKick && (
            <button
              onClick={() => onKick(p.playerId)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger, #ef4444)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
                opacity: 0.7,
              }}
              onMouseOver={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
              onMouseOut={(e) => { (e.target as HTMLElement).style.opacity = '0.7'; }}
              title={`Kick ${p.displayName}`}
            >
              Kick
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
