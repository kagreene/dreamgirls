"use strict";
//CHANGED CODE TO ORIGINAL CONFIG - 3.18.25
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Secret key should be stored in .env file
const secret = process.env.JWT_SECRET || 'mysecretsshhhhh';
const expiration = '2h';
const auth = {
    // Function to sign token
    signToken(user) {
        const payload = { _id: user._id, username: user.username, email: user.email };
        return jsonwebtoken_1.default.sign({ data: payload }, secret, { expiresIn: expiration });
    },
    // Middleware for resolvers
    authMiddleware({ req }) {
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
            const { data } = jsonwebtoken_1.default.verify(token, secret);
            return { user: data, req };
        }
        catch {
            console.log('Invalid token');
            return { req };
        }
    },
    // Helper to verify a user is logged in
    checkAuth(context) {
        if (!context.user) {
            throw new Error('You must be logged in to perform this action');
        }
        return context.user;
    },
};
exports.auth = auth;
