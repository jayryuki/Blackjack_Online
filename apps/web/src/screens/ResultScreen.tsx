import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, ThemeToggle } from '@games/ui';
import { clearRoom } from '../lib/gameContext.js';

export function ResultScreen() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleBackToLobby = () => {
    clearRoom();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: '2rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
          Game Over
        </h1>
        <ThemeToggle />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
        Room {roomCode}
      </p>
      <Button size="lg" onClick={handleBackToLobby}>
        Back to Lobby
      </Button>
    </div>
  );
}
