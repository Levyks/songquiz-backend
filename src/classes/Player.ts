import crypto from 'crypto';
import { Socket } from 'socket.io';
import { Room, Color } from '.';
import { PlayerEventComponent } from '../typings/eventsComponents';

export default class Player {

    nickname: string;
    score: number = 0;
    color: Color;
    token: string;
    
    socket?: Socket;
    room?: Room;

    disconnectionTimeout?: NodeJS.Timeout;
    static delayBeforeDisconnection = 60 * 1000;

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

    getSyncData(): PlayerEventComponent {
        return {
            nickname: this.nickname,
            color: this.color.toArray(),
            connected: this.connected,
            score: this.score,
        }
    }

}