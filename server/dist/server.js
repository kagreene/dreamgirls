"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const schemas_1 = require("./schemas"); //TODO: Resolve import issue 3.18.25 njw
const connection_1 = __importDefault(require("./config/connection"));
const auth_1 = require("./utils/auth");
// Load environment variables
dotenv_1.default.config();
// Set port
const PORT = process.env.PORT || 3001;
// Create Express app and HTTP server
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
// Create Apollo server
const server = new server_1.ApolloServer({
    typeDefs: schemas_1.typeDefs,
    resolvers: schemas_1.resolvers,
    plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
});
// Start Apollo server then apply middleware
const startApolloServer = async () => {
    await server.start();
    // Express middleware
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(express_1.default.json());
    // Apply Apollo middleware with CORS //TODO: resolve issue with Apollo midddle 3.18.25 njw
    app.use('/graphql', (0, cors_1.default)(), express_1.default.json(), (0, express4_1.expressMiddleware)(server, {
        context: async ({ req }) => {
            return (0, auth_1.authMiddleware)({ req });
        },
    }));
    // Serve static assets in production
    if (process.env.NODE_ENV === 'production') {
        app.use(express_1.default.static(path_1.default.join(__dirname, '../../client/dist')));
        app.get('*', (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '../../client/dist/index.html'));
        });
    }
    // MongoDB error handling
    connection_1.default.on('error', console.error.bind(console, 'MongoDB connection error:'));
    // Start server
    await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
};
// Start the server
startApolloServer().catch((err) => console.error(err));
