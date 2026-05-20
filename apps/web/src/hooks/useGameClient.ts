import { useState, useCallback, useRef } from 'react';
import { colyseusClient } from '../lib/colyseus.js';

export function useGameClient(roomId: string) {
  const [room, setRoom] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<any>(null);

  const forceUpdate = useCallback((s: any) => {
    // Deep-enough clone to break Colyseus Schema references for React re-renders
    const plain: any = {};
    for (const key of Object.keys(s)) {
      const val = s[key];
      if (val && typeof val === 'object' && typeof val.values === 'function') {
        // MapSchema — convert to plain array so React sees a new reference
        plain[key] = Array.from(val.values());
      } else if (val && typeof val === 'object' && typeof val[Symbol.iterator] === 'function' && !Array.isArray(val)) {
        // ArraySchema — convert to plain array
        plain[key] = Array.from(val);
      } else {
        plain[key] = val;
      }
    }
    return plain;
  }, []);

  const join = useCallback(async (displayName: string) => {
    try {
      const r = await colyseusClient.joinById(roomId, { displayName });
      roomRef.current = r;
      setRoom(r);
      // Read initial state immediately
      if (r.state) {
        setState(forceUpdate(r.state));
      }
      r.onStateChange((s: any) => {
        setState(forceUpdate(s));
      });
      r.onError((code: number, msg?: string) => setError(msg ?? 'Unknown error'));
    } catch (e: any) {
      setError(e.message || 'Failed to join room');
    }
  }, [roomId, forceUpdate]);

  const leave = useCallback(() => {
    roomRef.current?.leave();
    roomRef.current = null;
    setRoom(null);
    setState(null);
  }, []);

  const detachRoom = useCallback(() => {
    roomRef.current = null;
  }, []);

  return { room, state, error, join, leave, detachRoom };
}
