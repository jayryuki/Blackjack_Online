import { Server, matchMaker } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { createServer } from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { BlackjackRoom } from './rooms/BlackjackRoom.js';
import { RoomCodeService } from './services/RoomCodeService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDist = path.resolve(__dirname, '../../web/dist');

const getLocalRoomById = (matchMaker as any).getLocalRoomById.bind(matchMaker) as (roomId: string) => BlackjackRoom | undefined;

const app = express();
app.use(express.json());

// Serve web frontend
app.use(express.static(webDist));

const server = createServer(app);
const transport = new WebSocketTransport({ server });

const gameServer = new Server({ transport });

gameServer.define('blackjack', BlackjackRoom);

const roomCodeService = new RoomCodeService();

app.post('/api/rooms', async (req, res) => {
  const { displayName, preset } = req.body;
  const roomCode = roomCodeService.generateCode();
  const hostPlayerId = `player-${Date.now()}`;

  try {
    const room = await matchMaker.createRoom('blackjack', {
      preset: preset || 'standard',
      hostPlayerId,
      roomCode,
    });

    roomCodeService.register(roomCode, room.roomId);
    res.json({ roomCode, roomId: room.roomId, hostPlayerId, game: 'blackjack' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.get('/api/rooms', async (_req, res) => {
  try {
    const allEntries = [...roomCodeService.getAll().entries()];
    if (allEntries.length === 0) {
      res.json([]);
      return;
    }

    const result = [];

    for (const [code, roomId] of allEntries) {
      const room = getLocalRoomById(roomId);
      if (room) {
        const state = room.state as any;
        let hostName = '';
        if (state.players) {
          for (const p of state.players.values()) {
            if (p.isHost) { hostName = p.displayName; break; }
          }
        }
        result.push({
          roomId,
          roomCode: code,
          game: 'blackjack',
          hostName,
          playerCount: room.clients.length,
          maxPlayers: room.maxClients,
          openSlots: room.maxClients - room.clients.length,
          status: state.status ?? 'lobby',
        });
      } else {
        roomCodeService.remove(code);
      }
    }

    res.json(result);
  } catch (err) {
    const fallback = [...roomCodeService.getAll().entries()].map(([code, id]) => ({
      roomId: id,
      roomCode: code,
      hostName: '',
      playerCount: 0,
      maxPlayers: 7,
      openSlots: 7,
      status: 'lobby',
    }));
    res.json(fallback);
  }
});

app.get('/api/rooms/:code', (req, res) => {
  const roomId = roomCodeService.getRoomId(req.params.code);
  if (roomId) {
    res.json({ roomId, exists: true, game: 'blackjack' });
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

// SPA catch-all: serve index.html for all non-API routes (React Router)
app.get('*', (_req, res) => {
  res.sendFile(path.join(webDist, 'index.html'));
});

const PORT: number = parseInt(process.env.PORT || '3500', 10);
gameServer.listen(PORT).then(() => {
  console.log(`Blackjack server running on port ${PORT}`);
});
