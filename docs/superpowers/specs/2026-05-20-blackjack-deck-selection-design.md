# Blackjack Deck Selection & Multiplayer Betting Fix

**Date:** 2026-05-20  
**Status:** Approved  
**Author:** Jay + Claude

---

## Overview

Add configurable deck count (1, 2, 4, 6 decks) to the blackjack game with a visual indicator on the playing field. Fix a multiplayer bug where "waiting for other players" persists after all players finish betting.

---

## Deck Configuration

### Options
- 1, 2, 4, or 6 decks
- Default: 2 decks

### Access Control
- **Host only** can change the deck count
- If the host leaves, ownership transfers to another connected player

### When Changes Take Effect
- Changes apply at the **start of the next round**, not mid-round
- Server stores `pendingNumDecks` and applies it in `startBettingPhase()`

### State Sync
- `numDecks` is already in the Colyseus `GameState` schema
- Changes sync to all clients in real-time

---

## UI Design

### Lobby Screen (`LobbyScreen.tsx`)
- Add deck configuration section near `RulesSummary`
- Display four clickable card-stack icons (1, 2, 4, 6)
- Current selection highlighted
- Only host can interact; other players see it disabled
- Label: "Number of Decks"

### In-Game UI (`GameScreen.tsx`)
- Small deck indicator near the dealer area
- Host can click to open a popover with deck options
- Tooltip: "Changes apply next round"
- Non-hosts see the value but can't interact

### Visual Deck Indicator
- **Stacks of cards** displayed near the dealer area
- Number of stacks = number of decks (1 stack for 1 deck, 2 stacks for 2 decks, etc.)
- Label below: "1 Deck" / "2 Decks" / "4 Decks" / "6 Decks" (proper pluralization)
- Updates when host changes the setting

---

## Server Changes (`BlackjackRoom.ts`)

### Deck Configuration
- Change default `numDecks` from 6 to 2
- Add `pendingNumDecks` field
- Add `change-decks` message handler:
  - Validate sender is host
  - Validate value is 1, 2, 4, or 6
  - Update `pendingNumDecks` and `state.numDecks` immediately
- In `startBettingPhase()`: use `this.state.numDecks` when calling `createDeck()`

### Host Ownership Transfer
- In `onLeave()`: if leaving player is host, find next connected player
- Set them as host (`state.hostPlayerId`, `player.isHost`)
- If no other players remain, no transfer needed

### Bug Fix — Late Joiner Betting

**Root Cause:**  
`startBettingPhase()` sends `place-your-bet` only to players currently in the room. Players who join after this call never receive the prompt, but `checkAllBetsPlaced()` includes them in `getOccupiedSeats()`.

**Fix in `onJoin()`:**
```typescript
// After creating the player and assigning seat:
if (this.state.phase === 'BETTING') {
  const internal = this.internalState.get(client.sessionId);
  if (internal && !internal.hasBet) {
    client.send('place-your-bet', { 
      minBet: this.state.minBet, 
      maxBet: this.state.maxBet 
    });
    // Re-check after a tick to allow state to sync
    this.clock.setTimeout(() => this.checkAllBetsPlaced(), 100);
  }
}
```

This ensures:
- Late joiners receive the bet prompt
- After they bet, `checkAllBetsPlaced()` includes them and proceeds when ready
- 100ms delay allows new player's state to sync before re-checking

---

## Files to Modify

| File | Changes |
|------|---------|
| `apps/server/src/rooms/BlackjackRoom.ts` | Deck config, host transfer, bug fix |
| `apps/web/src/screens/LobbyScreen.tsx` | Deck selector UI |
| `apps/web/src/screens/GameScreen.tsx` | In-game deck selector + visual indicator |
| `apps/web/src/components/game/DeckStack.tsx` | New component for visual deck stacks |
| `apps/web/src/components/lobby/DeckSelector.tsx` | New component for deck selection |

---

## Testing Scenarios

1. **Single player:** Change deck count in lobby, verify it applies to next round
2. **Multiplayer:** Host changes deck count, all clients see the update
3. **Late joiner:** Player joins during betting phase, receives bet prompt, game proceeds after all bet
4. **Host leaves:** Ownership transfers, new host can change deck count
5. **Visual indicator:** Correct number of stacks displayed, label shows correct pluralization
