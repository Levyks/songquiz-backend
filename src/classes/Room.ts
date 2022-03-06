import { Store, Methods } from 'tepkijs';

import { Playlist, RoomStatus } from "../typings";
import { createRoomStore } from '../stores';
import Player from './Player';
import { Socket } from 'socket.io';

import '../services/playlist/spotify';

const MAX_AMOUNT_OF_TRIES_CODE_GENERATION = 50000;
const CODE_SIZE = 4;

export default class Room {

    static rooms: {[code: string]: Store<Room, Methods>} = {};

    code: string;
    status: RoomStatus = 'lobby';
    players: {[id: string]: Player} = {};
    leader: string;
    playlist: Playlist;

    constructor(code: string) {
        this.code = code;
    }

    setLeader(player: Player) {
        this.addPlayer(player);
        this.leader = player.nickname;
    }

    addPlayer(player: Player) {
        if(!this.players[player.nickname]) {
            player._room = this;
            this.players[player.nickname] = player;
        }
    }

    removePlayer(player: Player) {
        this.players[player.nickname] = undefined;
    }

    static generateCode(maxAmountOfTries?: number): string {

        let tried = 0;
        let code: string;
        
        while(!code || Room.rooms[code] || Room.rooms[code] === null) {
            if(maxAmountOfTries && tried > maxAmountOfTries) {
                throw new Error('Could not generate a unique code');
            }
            code = Math.floor(Math.random() * 10**CODE_SIZE).toString().padStart(CODE_SIZE, '0');
            tried++;
        }

        // Making sure that this code is "occupied" until the room is properly initialized
        Room.rooms[code] = null;

        return code;
    }

    static createRoom(leader: Player): Store<Room, Methods> {
        const code = Room.generateCode(MAX_AMOUNT_OF_TRIES_CODE_GENERATION);
        const room = new Room(code);

        room.setLeader(leader);

        const store = createRoomStore(room);
        Room.rooms[code] = store;

        return store;
    }


}