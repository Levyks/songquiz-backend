import crypto from 'crypto';
import { Socket } from 'socket.io';
import { PlayerSync } from 'typings/messages';
import { Room, Color } from '.';

export default class Player {

    nickname: string;
    score: number = 0;
    color: Color;
    token: string;
    socket?: Socket;
    room?: Room;

    constructor(nickname: string) {
        this.nickname = nickname;
        this.color = Color.random();
        this.token = Player.generateRandomToken();
    }

    get connected(): boolean {
        return !!this.socket?.connected;
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

    getSyncData(): PlayerSync {
        return {
            nickname: this.nickname,
            color: this.color.toArray(),
            connected: this.connected,
            score: this.score,
        }
    }

}