//CHANGED CODE TO ORIGINAL CONFIG - 3.18.25

import { Request } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface TokenUser {
  _id: string;
  username: string;
  email: string;
}

interface AuthContext {
  user?: TokenUser;
  req: Request;
}

// Secret key should be stored in .env file
const secret = process.env.JWT_SECRET || 'mysecretsshhhhh';
const expiration = '2h';

const auth = {
  // Function to sign token
  signToken( user : TokenUser): string {
    const payload = { _id: user._id, username: user.username, email: user.email };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },

  // Middleware for resolvers
  authMiddleware({ req }: { req: Request }): AuthContext {
    // Get token from headers
    let token = req.headers.authorization || '';

    // ["Bearer", "<tokenvalue>"]
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trim();
    }

    if (!token) {
      return { req };
    }

    try {
      // Verify token and get user data
      const { data } = jwt.verify(token, secret) as { data: TokenUser };
      return { user: data, req };
    } catch {
      console.log('Invalid token');
      return { req };
    }
  },

  // Helper to verify a user is logged in
  checkAuth(context: AuthContext): TokenUser {
    if (!context.user) {
      throw new Error('You must be logged in to perform this action');
    }
    return context.user;
  },
};

export { auth, AuthContext, TokenUser };