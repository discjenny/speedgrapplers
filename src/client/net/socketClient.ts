import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? undefined; // default same origin

export const socket: Socket = io(`${SOCKET_URL ?? ''}/game`, {
  path: '/socket.io',
  transports: ['websocket'],
  autoConnect: true,
});


