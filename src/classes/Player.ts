import crypto from 'crypto';
import { Socket } from 'socket.io';
import { Room } from '.';

export default class Player {

    nickname: string;
    score: number = 0;
    color: [number, number, number];
    _token: string;
    _socket: Socket;
    _room: Room;

    constructor(nickname: string) {
        this.nickname = nickname;
        this.color = Player.generateRandomColor();
        this._token = Player.generateRandomToken();
    }

    get connected() {
        return !!this._socket?.connected;
    }

    setSocket(socket: Socket) {
        socket.data.player = this;
        this._socket = socket;
        socket.on('disconnect', () => {
            console.log(`Player ${this.nickname} disconnected`);
            this._room?.removePlayer(this);
        });
    }

    static generateRandomToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    static generateRandomColor(): [number, number, number] {
        return [
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255)
        ];
    }

}