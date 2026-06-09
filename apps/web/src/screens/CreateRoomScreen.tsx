import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@games/ui';
import { GameShell } from '../components/layout/GameShell.js';

export function CreateRoomScreen() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');

  const handleCreate = async () => {
    if (!displayName.trim()) return;
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, preset: 'standard', game: 'blackjack' }),
      });
      const data = await res.json();
      navigate(`/lobby/${data.roomCode}?roomId=${data.roomId}&name=${encodeURIComponent(displayName)}`);
    } catch {}
  };

  return (
    <GameShell
      gameName="Blackjack Online"
      title="Create Room"
      subtitle="Open a clean, responsive table and bring everyone into the same room code."
      onBack={() => navigate('/')}
    >
      <div className="game-form-grid">
        <div className="game-field game-field--full">
          <Input label="Your Name" placeholder="Enter your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
      </div>
      <div className="game-shell__actions">
        <Button size="lg" onClick={handleCreate} disabled={!displayName.trim()} style={{ width: '100%' }}>
          Create Room
        </Button>
      </div>
    </GameShell>
  );
}
