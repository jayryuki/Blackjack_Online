import '@testing-library/jest-dom/vitest';
import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { GameScreen } from './GameScreen.js';

vi.mock('@games/ui', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  ThemeToggle: () => <button type="button">Theme</button>,
}));

vi.mock('../components/game/DealerArea.js', () => ({
  DealerArea: () => <div>Dealer</div>,
}));

vi.mock('../components/game/HandArea.js', () => ({
  HandArea: () => <div>Hand</div>,
}));

vi.mock('../components/game/ActionButtons.js', () => ({
  ActionButtons: () => <div>Actions</div>,
}));

vi.mock('../components/game/BetControls.js', () => ({
  BetControls: () => <div>Bet Controls</div>,
}));

vi.mock('../components/game/CardRenderer.js', () => ({
  CardRenderer: () => <div>Card</div>,
}));

vi.mock('../components/game/DeckStack.js', () => ({
  DeckStack: () => <div>Deck Stack</div>,
}));

vi.mock('../components/lobby/DeckSelector.js', () => ({
  DeckSelector: () => <div>Deck Selector</div>,
}));

vi.mock('../lib/gameContext.js', () => ({
  clearRoom: vi.fn(),
}));

vi.mock('../lib/sounds.js', () => ({
  playSound: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function createRoomMock() {
  const stateListeners = new Set<(state: any) => void>();
  const messageHandlers = new Map<string, Function[]>();
  const onStateChange: any = (listener: (state: any) => void) => {
    stateListeners.add(listener);
  };
  onStateChange.remove = (listener: (state: any) => void) => {
    stateListeners.delete(listener);
  };

  return {
    sessionId: 'me',
    state: {
      phase: 'BETTING',
      activeSeat: 255,
      activeHandIndex: 0,
      dealerCards: [],
      dealerStatus: 'waiting',
      minBet: 10,
      maxBet: 500,
      numDecks: 2,
      players: [
        {
          playerId: 'me',
          seatIndex: 0,
          displayName: 'Tester',
          bankroll: 1000,
          hands: [],
          hasBet: false,
          currentBet: 0,
          isHost: true,
        },
      ],
    },
    onStateChange,
    onMessage: (type: string, cb: Function) => {
      const handlers = messageHandlers.get(type) ?? [];
      handlers.push(cb);
      messageHandlers.set(type, handlers);
    },
    send: vi.fn(),
    leave: vi.fn(),
  };
}

describe('GameScreen', () => {
  it('renders synced room state after the initial loading render without crashing', async () => {
    const room = createRoomMock();

    render(
      <MemoryRouter>
        <GameScreen room={room} mySessionId="me" roomCode="ABCD" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tester ✎')).toBeInTheDocument();
      expect(screen.getByText('Bet Controls')).toBeInTheDocument();
    });
  });
});
