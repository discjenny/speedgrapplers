import type { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { z } from 'zod';
import type { RoomStats } from '../shared/../shared/events';

const joinSchema = z.object({
  roomCode: z.string().length(4),
  displayName: z.string().optional(),
  reconnectionToken: z.string().optional(),
});

const inputSchema = z.object({
  t: z.number().int().nonnegative(),
  ax: z.number().int().min(-127).max(127),
  ay: z.number().int().min(-127).max(127),
  buttons: z.number().int().min(0).max(0xffff),
  pressed: z.number().int().min(0).max(0xffff).optional(),
  released: z.number().int().min(0).max(0xffff).optional(),
});

export function installSockets(httpServer: HTTPServer): void {
  const io = new Server(httpServer, {
    path: '/socket.io',
    transports: ['websocket'],
  });

  const nsp = io.of('/game');
  const roomPlayers = new Map<string, Map<string, { name?: string; color: string }>>();
  const rooms = new Set<string>();

  function generateRoomCode(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ234567';
    let code = '';
    for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    return code;
  }

  nsp.on('connection', (socket) => {
    socket.data.lastT = 0 as number;
    socket.on('host:create', () => {
      let code = generateRoomCode();
      let guard = 0;
      while (rooms.has(code) && guard++ < 20) code = generateRoomCode();
      rooms.add(code);
      socket.join(code);
      socket.emit('host:create:ack', { ok: true, roomCode: code });
      roomPlayers.set(code, new Map());
      emitRoomStats(nsp, code, roomPlayers.get(code)!);
    });

    socket.on('controller:join', (payload) => {
      const parsed = joinSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit('controller:join:ack', { ok: false, reason: 'invalid_payload' });
        return;
      }
      const { roomCode, displayName } = parsed.data;
      if (!rooms.has(roomCode)) {
        socket.emit('controller:join:ack', { ok: false, reason: 'room_not_found' });
        return;
      }
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      const color = '#'+((Math.random()*0xffffff)|0).toString(16).padStart(6,'0');
      const players = roomPlayers.get(roomCode) ?? new Map();
      players.set(socket.id, { name: displayName, color });
      roomPlayers.set(roomCode, players);
      socket.emit('controller:join:ack', {
        ok: true,
        playerId: socket.id,
        color,
        reconnectionToken: socket.id,
      });
      emitRoomStats(nsp, roomCode, players);
    });

    socket.on('controller:input', (payload) => {
      const parsed = inputSchema.safeParse(payload);
      if (!parsed.success) return;
      const { t } = parsed.data;
      if (typeof socket.data.lastT === 'number' && t < socket.data.lastT) return;
      socket.data.lastT = t;
      // For M0, no further processing; future: integrate into sim
    });

    socket.on('disconnect', () => {
      const roomCode: string | undefined = socket.data.roomCode;
      if (!roomCode) return;
      const players = roomPlayers.get(roomCode);
      if (!players) return;
      players.delete(socket.id);
      emitRoomStats(nsp, roomCode, players);
    });
  });

  function emitRoomStats(ioNs: typeof nsp, roomCode: string, players: Map<string, { name?: string; color: string }>) {
    const payload: RoomStats = {
      roomCode,
      players: Array.from(players.entries()).map(([id, p]) => ({ id, name: p.name, color: p.color })),
    };
    ioNs.to(roomCode).emit('room:stats', payload);
  }
}


