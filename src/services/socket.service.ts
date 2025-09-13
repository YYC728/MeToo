import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import Message from '../models/message.model';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export class SocketService {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        if (!user.is_email_verified) {
          return next(new Error('Authentication error: Email not verified'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected`);

      // Join user's personal room
      socket.on('joinRoom', (room: string) => {
        socket.join(room);
        console.log(`User ${socket.userId} joined room ${room}`);
      });

      // Handle sending messages
      socket.on('sendMessage', async (data: { receiver_id: string; content: string }) => {
        try {
          const { receiver_id, content } = data;

          // Check if users are blocked
          const sender = await User.findById(socket.userId);
          const receiver = await User.findById(receiver_id);

          if (!sender || !receiver) {
            socket.emit('error', { message: 'User not found' });
            return;
          }

          // Check if users have blocked each other
          if (sender.blocked_users.includes(receiver_id) || 
              receiver.blocked_users.includes(socket.userId)) {
            socket.emit('error', { message: 'Cannot send message to this user' });
            return;
          }

          // Create and save message
          const message = new Message({
            sender_id: socket.userId,
            receiver_id,
            content,
          });

          await message.save();

          // Emit message to receiver
          this.io.to(receiver_id).emit('newMessage', {
            _id: message._id,
            sender_id: message.sender_id,
            receiver_id: message.receiver_id,
            content: message.content,
            created_at: message.created_at,
          });

          // Confirm to sender
          socket.emit('messageSent', {
            _id: message._id,
            receiver_id: message.receiver_id,
            content: message.content,
            created_at: message.created_at,
          });

        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
      });
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default SocketService;
