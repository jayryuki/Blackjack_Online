import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { ThemeToggle } from '../components/common/ThemeToggle.js';

export function CreateRoomScreen() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');

  const handleCreate = async () => {
    if (!displayName.trim()) return;
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, preset: 'standard' }),
      });
      const data = await res.json();
      navigate(`/lobby/${data.roomCode}?roomId=${data.roomId}&name=${encodeURIComponent(displayName)}`);
    } catch {
      // Error handling
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '480px' }}>
        <Button variant="ghost" onClick={() => navigate('/')}>&larr; Back</Button>
        <ThemeToggle />
      </div>
      <h1 style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: '2rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
        Create Room
      </h1>
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Input label="Your Name" placeholder="Enter your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <Button size="lg" onClick={handleCreate} disabled={!displayName.trim()} style={{ width: '100%' }}>
          Create Room
        </Button>
      </div>
    </div>
  );
}
