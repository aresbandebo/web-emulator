import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import http from 'http';
import cors from 'cors';

const app = express();
app.use(cors()); // Allow all origins

// Create the bare server instance
const bareServer = createBareServer('/bare/');

// Basic route to check if server is active
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Bare Server Status</title></head>
            <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #0f172a; color: white;">
                <div style="text-align: center;">
                    <h1 style="color: #10b981;">✅ Bare Server is Active on Render</h1>
                    <p>This backend is ready to process proxy traffic for Ultraviolet.</p>
                </div>
            </body>
        </html>
    `);
});

const server = http.createServer();

// Route traffic to either the Express app or the Bare Server
server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

// Render automatically assigns a PORT environment variable
const port = process.env.PORT || 8080;

server.listen(port, () => {
    console.log("Bare Server is running on port " + port);
});
