import { createServer } from 'http';
import app from './app';
import SocketService from './services/socket.service';

const PORT = process.env.PORT || 3000;

const server = createServer(app);

// Initialize Socket.IO
const socketService = new SocketService(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});

export default server;
