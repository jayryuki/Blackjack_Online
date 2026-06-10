import React, { useState } from 'react';

interface PlayerListProps {
  players: Array<{ playerId: string; displayName: string; isConnected: boolean; isReady: boolean; bankroll?: number }>;
  isHost?: boolean;
  myPlayerId?: string;
  onKick?: (playerId: string) => void;
  onChangeName?: (name: string) => void;
}

export function PlayerList({ players, isHost, myPlayerId, onKick, onChangeName }: PlayerListProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
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
          {p.playerId === myPlayerId ? (
            editingName ? (
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={() => {
                  const trimmed = nameInput.trim().slice(0, 20);
                  if (trimmed && trimmed !== p.displayName) {
                    onChangeName?.(trimmed);
                    try { localStorage.setItem('blackjack_displayName', trimmed); } catch {}
                  }
                  setEditingName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  background: 'var(--surface-panel-raised)',
                  border: '1px solid var(--accent-warm)',
                  borderRadius: '8px',
                  padding: '0.35rem 0.5rem',
                  outline: 'none',
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => { setNameInput(p.displayName); setEditingName(true); }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  background: 'transparent',
                  border: 'none',
                  padding: '0.2rem 0',
                  cursor: 'pointer',
                }}
                title="Click to change name"
              >
                {p.displayName} ✎
              </button>
            )
          ) : (
            <span style={{ flex: 1, minWidth: 0, color: 'var(--text-primary)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.displayName}</span>
          )}
          {p.bankroll !== undefined && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>${p.bankroll}</span>
          )}
          {p.isReady && <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, whiteSpace: 'nowrap' }}>Ready</span>}
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
