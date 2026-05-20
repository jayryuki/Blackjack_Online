# Blackjack Deck Selection & Betting Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add configurable deck count (1, 2, 4, 6 decks) with visual indicator and fix multiplayer betting bug for late joiners.

**Architecture:** Host-only deck configuration synced via Colyseus schema. Visual card stack indicator on playing field. Bug fix sends `place-your-bet` to players who join during BETTING phase.

**Tech Stack:** TypeScript, React, Colyseus, Vite

---

## File Structure

| File | Purpose |
|------|---------|
| `apps/server/src/rooms/BlackjackRoom.ts` | Server: deck config, host transfer, betting bug fix |
| `apps/web/src/components/lobby/DeckSelector.tsx` | New: deck selection component for lobby |
| `apps/web/src/components/game/DeckStack.tsx` | New: visual deck stack indicator |
| `apps/web/src/screens/LobbyScreen.tsx` | Add deck selector to lobby |
| `apps/web/src/screens/GameScreen.tsx` | Add in-game deck selector + visual indicator |

---

### Task 1: Server — Change Default Deck Count

**Files:**
- Modify: `apps/server/src/rooms/BlackjackRoom.ts:60`

- [ ] **Step 1: Change default numDecks from 6 to 2**

```typescript
// Line 60, change:
this.state.numDecks = 6;
// To:
this.state.numDecks = 2;
```

- [ ] **Step 2: Verify the change**

Read the file and confirm line 60 now shows `this.state.numDecks = 2;`

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/rooms/BlackjackRoom.ts
git commit -m "feat: change default deck count from 6 to 2"
```

---

### Task 2: Server — Add change-decks Message Handler

**Files:**
- Modify: `apps/server/src/rooms/BlackjackRoom.ts:53-101` (onCreate method)

- [ ] **Step 1: Add change-decks message handler in onCreate**

After the existing `chat` message handler (around line 101), add:

```typescript
this.onMessage('change-decks', (client, data: { numDecks: number }) => {
  // Only host can change decks
  if (client.sessionId !== this.state.hostPlayerId) return;

  // Validate deck count
  const validDecks = [1, 2, 4, 6];
  if (!validDecks.includes(data.numDecks)) return;

  // Update numDecks immediately (syncs to all clients)
  this.state.numDecks = data.numDecks;
});
```

- [ ] **Step 2: Test manually**

Start the server and verify:
- Non-host players cannot change deck count (message ignored)
- Host can change to 1, 2, 4, or 6
- Invalid values (3, 5, 0, etc.) are rejected
- All clients see the updated `numDecks` value

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/rooms/BlackjackRoom.ts
git commit -m "feat: add change-decks message handler for host"
```

---

### Task 3: Server — Host Ownership Transfer

**Files:**
- Modify: `apps/server/src/rooms/BlackjackRoom.ts:132-150` (onLeave method)

- [ ] **Step 1: Add host transfer logic in onLeave**

After line 139 (`this.state.players.delete(client.sessionId);`), add:

```typescript
// Transfer host ownership if the leaving player was host
if (client.sessionId === this.state.hostPlayerId) {
  const remainingPlayers = Array.from(this.state.players.values());
  if (remainingPlayers.length > 0) {
    const newHost = remainingPlayers[0];
    this.state.hostPlayerId = newHost.playerId;
    newHost.isHost = true;
  }
}
```

- [ ] **Step 2: Test manually**

- Create a room with Player 1 (host)
- Have Player 2 join
- Player 1 leaves
- Verify Player 2 becomes host (check `state.hostPlayerId` and `player.isHost`)

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/rooms/BlackjackRoom.ts
git commit -m "feat: transfer host ownership when host leaves"
```

---

### Task 4: Server — Fix Late Joiner Betting Bug

**Files:**
- Modify: `apps/server/src/rooms/BlackjackRoom.ts:104-130` (onJoin method)

- [ ] **Step 1: Add late joiner betting logic in onJoin**

After line 129 (after `this.internalState.set(...)`), add:

```typescript
// If joining during BETTING phase, send bet prompt to new player
if (this.state.phase === 'BETTING') {
  const internal = this.internalState.get(client.sessionId);
  if (internal && !internal.hasBet) {
    client.send('place-your-bet', {
      minBet: this.state.minBet,
      maxBet: this.state.maxBet,
    });
    // Re-check after a tick to allow state to sync
    this.clock.setTimeout(() => this.checkAllBetsPlaced(), 100);
  }
}
```

- [ ] **Step 2: Test the bug fix**

- Player 1 creates room, starts game, places bet
- Player 2 joins during BETTING phase
- Verify Player 2 receives `place-your-bet` message
- Player 2 places bet
- Verify game proceeds to DEALING (not stuck at "waiting for other players")

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/rooms/BlackjackRoom.ts
git commit -m "fix: send bet prompt to late joiners during BETTING phase"
```

---

### Task 5: Create DeckSelector Component (Lobby)

**Files:**
- Create: `apps/web/src/components/lobby/DeckSelector.tsx`

- [ ] **Step 1: Create DeckSelector component**

```typescript
import React from 'react';

interface DeckSelectorProps {
  numDecks: number;
  isHost: boolean;
  onChange: (numDecks: number) => void;
}

const DECK_OPTIONS = [1, 2, 4, 6];

export function DeckSelector({ numDecks, isHost, onChange }: DeckSelectorProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '0.75rem',
      borderRadius: '8px',
      background: 'rgba(255,255,255,0.05)',
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        Number of Decks
      </div>
      <div style={{
        display: 'flex',
        gap: '0.5rem',
      }}>
        {DECK_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => isHost && onChange(option)}
            disabled={!isHost}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: numDecks === option
                ? '2px solid var(--accent-warm)'
                : '2px solid rgba(255,255,255,0.1)',
              background: numDecks === option
                ? 'rgba(255,255,255,0.1)'
                : 'transparent',
              cursor: isHost ? 'pointer' : 'default',
              opacity: isHost ? 1 : 0.6,
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', gap: '-2px' }}>
              {Array.from({ length: option }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '12px',
                    height: '16px',
                    borderRadius: '2px',
                    background: numDecks === option
                      ? 'var(--accent-warm)'
                      : 'rgba(255,255,255,0.3)',
                    marginLeft: i > 0 ? '-4px' : 0,
                    zIndex: i,
                  }}
                />
              ))}
            </div>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: numDecks === option
                ? 'var(--accent-warm)'
                : 'rgba(255,255,255,0.7)',
            }}>
              {option} {option === 1 ? 'Deck' : 'Decks'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify component renders**

Import and render the component in a test location to verify it displays correctly.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/lobby/DeckSelector.tsx
git commit -m "feat: create DeckSelector component for lobby"
```

---

### Task 6: Add DeckSelector to LobbyScreen

**Files:**
- Modify: `apps/web/src/screens/LobbyScreen.tsx:1-106`

- [ ] **Step 1: Import DeckSelector**

Add import at top of file:

```typescript
import { DeckSelector } from '../components/lobby/DeckSelector.js';
```

- [ ] **Step 2: Add DeckSelector to lobby UI**

After the `<RulesSummary />` section (around line 75), add:

```typescript
<div>
  <DeckSelector
    numDecks={state?.numDecks ?? 2}
    isHost={isHost}
    onChange={(numDecks) => room?.send('change-decks', { numDecks })}
  />
</div>
```

- [ ] **Step 3: Test in browser**

- Open lobby as host
- Verify deck selector shows 4 options (1, 2, 4, 6)
- Click different options, verify `numDecks` updates in state
- Open lobby as non-host, verify selector is disabled

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/screens/LobbyScreen.tsx
git commit -m "feat: add DeckSelector to lobby screen"
```

---

### Task 7: Create DeckStack Component (Visual Indicator)

**Files:**
- Create: `apps/web/src/components/game/DeckStack.tsx`

- [ ] **Step 1: Create DeckStack component**

```typescript
import React from 'react';

interface DeckStackProps {
  numDecks: number;
}

export function DeckStack({ numDecks }: DeckStackProps) {
  const label = `${numDecks} ${numDecks === 1 ? 'Deck' : 'Decks'}`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.25rem',
    }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {Array.from({ length: numDecks }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '24px',
              height: '32px',
              borderRadius: '3px',
              background: 'linear-gradient(135deg, #2a5a3a 0%, #1a3a2a 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              marginLeft: i > 0 ? '-8px' : 0,
              zIndex: i,
            }}
          />
        ))}
      </div>
      <div style={{
        fontSize: '0.625rem',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {label}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify component renders**

Import and render the component to verify it displays correctly with different `numDecks` values.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/game/DeckStack.tsx
git commit -m "feat: create DeckStack visual indicator component"
```

---

### Task 8: Add DeckStack and In-Game Deck Selector to GameScreen

**Files:**
- Modify: `apps/web/src/screens/GameScreen.tsx:1-478`

- [ ] **Step 1: Import DeckStack and DeckSelector**

Add imports at top of file:

```typescript
import { DeckStack } from '../components/game/DeckStack.js';
import { DeckSelector } from '../components/lobby/DeckSelector.js';
```

- [ ] **Step 2: Add deck selector popover state**

After the existing state declarations (around line 24), add:

```typescript
const [showDeckSelector, setShowDeckSelector] = useState(false);
```

- [ ] **Step 3: Add DeckStack to dealer area**

In the table area, before the `<DealerArea>` component (around line 209), add:

```typescript
{/* Deck visual indicator */}
<div style={{
  position: 'absolute',
  top: '0.5rem',
  right: '0.5rem',
  zIndex: 10,
}}>
  <div
    onClick={() => myPlayer?.isHost && setShowDeckSelector(!showDeckSelector)}
    style={{ cursor: myPlayer?.isHost ? 'pointer' : 'default', position: 'relative' }}
    title={myPlayer?.isHost ? 'Click to change deck count (applies next round)' : `${state.numDecks} ${state.numDecks === 1 ? 'Deck' : 'Decks'}`}
  >
    <DeckStack numDecks={state.numDecks ?? 2} />
  </div>

  {/* Deck selector popover for host */}
  {showDeckSelector && myPlayer?.isHost && (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '0.5rem',
      background: 'var(--surface-card)',
      borderRadius: '12px',
      padding: '0.75rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      zIndex: 20,
    }}>
      <div style={{
        fontSize: '0.625rem',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '0.5rem',
      }}>
        Changes apply next round
      </div>
      <DeckSelector
        numDecks={state.numDecks ?? 2}
        isHost={true}
        onChange={(numDecks) => {
          room?.send('change-decks', { numDecks });
          setShowDeckSelector(false);
        }}
      />
    </div>
  )}
</div>
```

- [ ] **Step 4: Add position relative to table area**

The table area div needs `position: 'relative'` for the absolute positioning to work. Update the style of the table area div (around line 197):

```typescript
// Add position: 'relative' to the existing style object
position: 'relative',
```

- [ ] **Step 5: Test in browser**

- Start a game as host
- Verify deck stack visual appears in top-right of table
- Click the stack, verify popover appears with deck options
- Change deck count, verify it updates visually
- Verify non-host players see the stack but can't interact
- Start next round, verify deck count is used (check server logs or card count)

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/screens/GameScreen.tsx
git commit -m "feat: add DeckStack visual and in-game deck selector"
```

---

### Task 9: Update GameState Schema Default

**Files:**
- Modify: `apps/server/src/rooms/schema/GameState.ts:53`

- [ ] **Step 1: Change default numDecks from 6 to 2**

```typescript
// Line 53, change:
@type('uint8') numDecks: number = 6;
// To:
@type('uint8') numDecks: number = 2;
```

- [ ] **Step 2: Commit**

```bash
git add apps/server/src/rooms/schema/GameState.ts
git commit -m "feat: update GameState schema default numDecks to 2"
```

---

### Task 10: Build and Verify

**Files:**
- None (verification only)

- [ ] **Step 1: Build the project**

```bash
cd /home/jay/User_Apps/Blackjack_Online
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Start the server**

```bash
pnpm --filter @blackjack/server dev
```

Expected: Server starts on configured port.

- [ ] **Step 3: Start the web client**

```bash
pnpm --filter @blackjack/web dev
```

Expected: Web client starts on configured port.

- [ ] **Step 4: Test full flow**

1. Create a room as Player 1
2. Verify deck selector shows in lobby with 2 Decks selected
3. Change to 4 Decks
4. Have Player 2 join the room
5. Both players ready up
6. Start the round
7. Verify 4 deck stacks shown on the playing field
8. Player 1 places bet
9. **Player 3 joins during BETTING phase**
10. Verify Player 3 receives bet prompt
11. Player 3 places bet
12. Verify game proceeds to DEALING (not stuck)
13. Complete the round
14. Change deck count to 1 Deck
15. Start next round
16. Verify 1 deck stack shown

- [ ] **Step 5: Commit all changes**

```bash
git add -A
git commit -m "feat: complete deck selection and betting fix implementation"
```

---

### Task 11: Push to GitHub and Deploy

**Files:**
- None (deployment)

- [ ] **Step 1: Push to GitHub**

```bash
git push origin main
```

Expected: Push succeeds.

- [ ] **Step 2: Deploy to production**

```bash
ssh -i ~/.ssh/oracle.key ubuntu@163.192.50.203
```

Once connected, pull the latest changes and rebuild:

```bash
cd /path/to/blackjack/app
git pull
pnpm install
pnpm build
# Restart the server (command depends on how it's running)
```

- [ ] **Step 3: Verify production deployment**

- Open the production URL
- Create a room
- Verify deck selector works
- Start a game
- Verify visual indicator shows

- [ ] **Step 4: Final commit (if any changes made during deployment)**

```bash
git add -A
git commit -m "chore: production deployment verification"
```
