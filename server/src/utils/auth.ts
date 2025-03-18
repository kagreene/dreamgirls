import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';

dotenv.config();

// Define interface for user data in the token
interface TokenUser {
  username: string;
  email: string;
  _id: string;
}
// Context interface for Apollo Server
export interface AuthContext {
  user?: TokenUser;
  req: Request;
}
// Get secret key from environment variables
const secret = process.env.JWT_SECRET_KEY || 'default_secret_key';
const expiration = '2h';

export const signToken = (username: string, email: string, _id: string): string => {
  // Create a payload with the user information
  const payload = { username, email, _id };
  
  // Sign the token with the payload and secret key, and set it to expire in 2 hours
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

// Context function for Apollo Server v4
export const authMiddleware = ({ req }: { req: Request }): AuthContext => {
  // Allow token to be sent via req.body, req.query, or headers
  let token = req.headers.authorization || '';

  // If the token is sent in the authorization header, extract the token from the header
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trim();
  }

  // If no token is provided, return just the request object
  if (!token) {
    return { req };
  }

  try {
    // Verify the token
    const { data } = jwt.verify(token, secret) as { data: TokenUser };
    
    // Return user data and request object
    return { user: data, req };
  } catch (err) {
    console.log('Invalid token');
    return { req };
  }
};

// Helper function to check if user is authenticated
export const checkAuth = (context: AuthContext): TokenUser => {
  if (!context.user) {
    throw new AuthenticationError('Not authenticated. Please log in.');
  }
  return context.user;
};

// Custom authentication error class
export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: { code: 'UNAUTHENTICATED' }
    });
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
}