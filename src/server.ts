import './env';
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import Controller from './http';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

app.use(Controller);

const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

export {
    io
}