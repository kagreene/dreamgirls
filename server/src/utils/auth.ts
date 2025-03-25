import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = ({ req }: any) => {
  // Allows token to be sent via req.body, req.query, or headers
  let token = req.body.token || req.query.token || req.headers.authorization;
  
  // If the token is sent in the authorization header, extract the token from the header
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }
  
  // If no token is provided, return the request object as is
  if (!token) {
    return req;
  }
  
  // Try to verify the token
  
  try {
    console.log('secretKey:', process.env.JWT_SECRET_KEY);
    const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '2h' });
    console.log('token:',token)
    req.user = data;
  } catch (err) {
    console.log('Invalid token');
  }
  
  // Return the request object
  return req;
};
console.log('Secret Key:', process.env.JWT_SECRET_KEY)
export const signToken = (username: string, email: string, _id: unknown) => {
  // Create a payload with the user information
  const payload = { username, email, _id };
  //const secretKey: any = process.env.JWT_SECRET_KEY;
  //console.log('Secret Key:', secretKey);
  // Sign the token with the payload and secret key, and set it to expire in 2 hours
  return jwt.sign({ data: payload }, process.env.JWT_SECRET_KEY || '', { expiresIn: '2h' });
};

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
}