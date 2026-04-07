import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Initialize socket connection
// Using transport: ['websocket'] for better performance on Render
export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 5000,
});

// Diagnostic listeners
socket.on('connect', () => {
  console.log('Socket.io: Connected to Backend Real-time Engine.');
});

socket.on('disconnect', (reason) => {
  console.log('Socket.io: Disconnected. Reason:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Socket.io Error:', error.message);
});
