import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Lazily create (and cache) the authenticated Socket.io connection.
 * The backend authenticates the handshake with the JWT access token.
 */
export function getSocket(token?: string | null): Socket {
  if (socket) {
    if (token) socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }
  socket = io(import.meta.env.APP_API_URL, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: true,
    auth: { token: token ?? undefined },
  });
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
