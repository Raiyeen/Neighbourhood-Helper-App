import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

type NextApiResponseServerIO = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export default function ioHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io');

    const io = new ServerIO(res.socket.server, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    const activeUsers = new Map<number, string>(); // userId -> socketId

    io.on('connection', socket => {
      console.log('socket connected:', socket.id);
      
      socket.on('register', (userId: number) => {
        if (userId) {
          activeUsers.set(userId, socket.id);
          console.log(`User ${userId} registered with socket ${socket.id}`);
        }
      });

      socket.on('send-message', async (data) => {
        const { receiverId, conversationId, message } = data;
        
        // Target specific user for real-time delivery
        const recipientSocketId = activeUsers.get(receiverId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive-message', {
            conversationId,
            message
          });
        }
      });

      socket.on('send-notification', async (data) => {
         const { targetUserId, notification } = data;
         const recipientSocketId = activeUsers.get(targetUserId);
         if (recipientSocketId) {
           io.to(recipientSocketId).emit('receive-notification', notification);
         }
      });

      socket.on('disconnect', () => {
        // find and delete user
        for (const [userId, socketId] of activeUsers.entries()) {
          if (socketId === socket.id) {
            activeUsers.delete(userId);
            break;
          }
        }
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
