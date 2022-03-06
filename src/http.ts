import express from 'express';
import cors from 'cors';
import { Room, Player } from './classes';

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

    const room = Room.createRoom(leader);

    res.json({
        message: 'Room created successfully',
        code: room.state?.code,
        nickname: leader.nickname,
        token: leader._token
    });

    console.log('created -> ', room.state?.code);

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
    room.state?.addPlayer(player);

    res.json({
        message: 'Player joined successfully',
        code: room.state?.code,
        nickname: player.nickname,
        token: player._token
    });

    console.log('joined -> ', room.state?.code, player.nickname);

});

export default router;