import type { Room } from 'colyseus.js';

interface GameContextState {
  room: Room<any> | null;
  mySessionId: string;
}

const gameContext: GameContextState = {
  room: null,
  mySessionId: '',
};

export function getRoom(): Room<any> | null {
  return gameContext.room;
}

export function setRoom(room: Room<any>, sessionId: string): void {
  gameContext.room = room;
  gameContext.mySessionId = sessionId;
}

export function getMySessionId(): string {
  return gameContext.mySessionId;
}

export function clearRoom(): void {
  gameContext.room = null;
  gameContext.mySessionId = '';
}
