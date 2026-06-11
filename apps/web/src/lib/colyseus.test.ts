import { describe, expect, it } from 'vitest';
import { getColyseusUrl } from './colyseus';

describe('getColyseusUrl', () => {
  it('uses the local game server directly during Vite development', () => {
    expect(getColyseusUrl({ isDev: true, protocol: 'http:', host: 'localhost:3001' })).toBe('ws://localhost:2500');
  });

  it('uses the current host outside development', () => {
    expect(getColyseusUrl({ isDev: false, protocol: 'https:', host: 'blackjack.example.com' })).toBe('wss://blackjack.example.com');
  });

  it('honors an explicit override', () => {
    expect(getColyseusUrl({ override: 'wss://games.example.com', isDev: true, protocol: 'http:', host: 'localhost:3001' })).toBe('wss://games.example.com');
  });
});
