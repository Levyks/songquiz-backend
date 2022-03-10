
import { Player, Playlist } from '.';

import { BroadcastOperator, Server } from '../typings/socket';
import { PlayerSync, PlaylistSource, RoomSync } from "typings/messages";

import '../services/playlist/spotify';

const MAX_AMOUNT_OF_TRIES_CODE_GENERATION = 50000;
const CODE_SIZE = 4;

export enum RoomStatus {
    Lobby = 'lobby',
    Starting = 'starting',
    Playing = 'playing',
    Finished = 'finished'
}

export default class Room {

    static rooms: {[code: string]: Room} = {};

    status: RoomStatus = RoomStatus.Lobby;
    players: {[id: string]: Player} = {};
    playlist?: Playlist;
    channel: BroadcastOperator;

    get playersArray(): Player[] {
        return Object.values(this.players);
    }

    constructor(
        public code: string,
        public leader: Player,
        io: Server,
    ) {
        Room.rooms[code] = this; 
        this.addPlayer(leader);

        this.channel = io.to(code);
    }

    /** Players */

    setLeader(player: Player) {
        if(!this.players[player.nickname]) this.addPlayer(player);
        this.leader = player;
        this.syncLeader();
    }

    isLeader(player: Player) {
        return this.leader.nickname === player.nickname;
    }

    addPlayer(player: Player) {
        if(!this.players[player.nickname]) {
            player.room = this;
            this.players[player.nickname] = player;
            this.syncPlayer(player);
        }
    }

    removePlayer(player: Player) {
        if(this.players[player.nickname]) {
            delete this.players[player.nickname];
            this.syncPlayerDisconnection(player);    
        }
    }

    handleDisconnection(player: Player) {
        this.removePlayer(player);
    }

    getPlayersSyncData(): PlayerSync[] {
        return this.playersArray.map(player => player.getSyncData());
    }

    syncPlayers() {
        this.channel.emit('sync:players', this.getPlayersSyncData());
    }

    syncLeader() {
        this.channel.emit('sync:leader', this.leader.nickname);
    }

    syncPlayer(player: Player) {
        this.channel.emit('sync:player', player.getSyncData());
    }

    syncPlayerDisconnection(player: Player) {
        this.channel.emit('delete:player', player.nickname);
    }

    /** /Players */

    /** Playlist */

    fetchPlaylist(source: PlaylistSource): Promise<void> {
        return Playlist.fetch(source).then(this.setPlaylist);
    }

    setPlaylist(playlist: Playlist) {
        this.playlist = playlist;
        this.syncPlaylist();
    }

    syncPlaylist() {
        this.channel.emit('sync:playlist', this.playlist?.getSyncData());
    }

    /** /Playlist */

    static generateCode(maxAmountOfTries: number = MAX_AMOUNT_OF_TRIES_CODE_GENERATION): string | null {

        let tried = 0;
        let code: string | null = null;
        
        while(!code || Room.rooms[code]) {
            if(maxAmountOfTries && tried > maxAmountOfTries) {
                return null
            }
            code = Math.floor(Math.random() * 10**CODE_SIZE).toString().padStart(CODE_SIZE, '0');
            tried++;
        }

        return code;
    }

    getSyncData(): RoomSync {
        return {
            code: this.code,
            leader: this.leader.nickname,
            players: this.playersArray.map(player => player.getSyncData()),
            status: this.status,
            playlist: this.playlist?.getSyncData()
        }
    }


}