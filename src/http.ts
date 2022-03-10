import express from 'express';
import cors from 'cors';

import { Room, Player } from './classes';
import { io } from './server';

const router = express.Router();

router.use(cors());
router.use(express.json());

router.put('/room', (req, res) => {

    const nickname: string = req.body.nickname;

    if(!nickname) {
        return res.status(400).json({
            error: 'Nickname is required'
        });
    }

    const leader = new Player(nickname);

    const code = Room.generateCode();

    if(!code) {
        return res.status(503).json({
            error: 'Could not generate code'
        });
    }

    const room = new Room(code, leader, io);

    res.json({
        message: 'Room created successfully',
        code: room.code,
        nickname: leader.nickname,
        token: leader.token
    });

});

router.post('/room/:code', (req, res) => {
    
    const code: string = req.params.code;
    const nickname: string = req.body.nickname;

    const room = Room.rooms[code];

    if(!room) {
        return res.status(404).json({
            message: 'Room not found'
        });
    }

    const player = new Player(nickname);
    room.addPlayer(player);

    res.json({
        message: 'Player joined successfully',
        code: room.code,
        nickname: player.nickname,
        token: player.token
    });

});

export default router;