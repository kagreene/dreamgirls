import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';

dotenv.config();

//define interface for user data in the token
interface TokenUser {
    username: string;
    email: string;
    _id: string;
}

//context interface for Apollo Server
export interface AuthContext {
    user?: TokenUser;
    req: Request;
}

//get secret key from environment variables
const secret = process.env.JWT_SECRET_KEY || 'default_secret_key';
const expiration = '2h';

export const signToken = (username: string, email: string, _id: string): string => {
    //create payload with user information
    const payload = { username, email, _id };

    //sign token with payload and secret key, and set to expire in 2 hours
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

export const authMiddleware = ({ req }: { req: Request }): AuthContext => {
    //allow token to be sent via req.body, req.query, or headers
    let token = req.headers.authorization || '';

    //if token is sent in the authorization header, extract token from the header
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trim();
    }

    //if no token is provided, return just request object
    if (!token) {
        return { req };
    }
    
    try {
        //verify the token
        const { data } = jwt.verify(token, secret) as { data: TokenUser };

        //return user data and request object
        return { user: data, req };
    } catch (err) {
        console.log('Invalid token');
        return { req };
    }
};

// helper function to check if user is authenticated
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