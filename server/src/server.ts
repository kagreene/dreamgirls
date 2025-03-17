import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { typeDefs, resolvers } from './schemas';
import db from './config/connection';
import { authMiddleware } from './utils/auth';

// Load environment variables
dotenv.config();

// Set port
const PORT = process.env.PORT || 3001;

// Create Express app and HTTP server
const app = express();
const httpServer = http.createServer(app);

// Create Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Start Apollo server then apply middleware
const startApolloServer = async () => {
  await server.start();
  
  // Express middleware
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
  // Apply Apollo middleware with CORS
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: authMiddleware,
    })
  );
  
  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/dist')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });
  }
  
  // MongoDB error handling
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  
  // Start server
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  
  console.log(`API server running on port ${PORT}!`);
  console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
};

// Start the server
startApolloServer().catch((err) => console.error(err));