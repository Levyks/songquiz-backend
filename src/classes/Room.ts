
import { Player, Playlist, Round } from '.';

import { BroadcastOperator, Server, Socket } from '../typings/socket';
import { PlayerSync, PlaylistSource, RoomSync } from "../typings/messages";
import { RoomOptions } from 'typings';

const MAX_AMOUNT_OF_TRIES_CODE_GENERATION = 50000;
const CODE_SIZE = 4;

export enum RoomStatus {
    Lobby = 'lobby',
    Starting = 'starting',
    Playing = 'playing',
    Finished = 'finished'
}

export enum RoomGuessMode {
    Song = 'song',
    Artist = 'artist',
    Both = 'both'
}

export default class Room {

    static rooms: {[code: string]: Room} = {};

    status: RoomStatus = RoomStatus.Lobby;
    players: {[id: string]: Player} = {};
    options: RoomOptions = Room.getDefaultOptions();
    channel: BroadcastOperator;

    playlist?: Playlist;
    
    rounds?: Round[];
    currentRoundIdx: number = 0;

    get playersArray(): Player[] {
        return Object.values(this.players);
    }

    get currentRound(): Round | undefined {
        return this.rounds?.[this.currentRoundIdx];
    }

    constructor(
        public code: string,
        public leader: Player,
        io: Server,
    ) {
        Room.rooms[code] = this; 
        this.channel = io.to(code);
        this.addPlayer(leader);
    }

    startGame() {

        this.rounds = [];
        this.currentRoundIdx = 0;

        for (let i = 0; i < this.options.numberOfRounds; i++) {
            this.rounds.push(new Round(this, i));
        }

        console.log(this.rounds);

        this.setStatus(RoomStatus.Starting);

        setTimeout(() => {
            this.currentRound!.start();
            this.setStatus(RoomStatus.Playing);
        }, 5000);
    }

    setStatus(status: RoomStatus) {
        this.status = status;
        this.syncStatus();
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
        this.syncPlayerDisconnection(player);
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
        return Playlist.fetch(source)
            .then((playlist) => this.setPlaylist(playlist));
    }

    setPlaylist(playlist: Playlist) {
        this.playlist = playlist;
        this.syncPlaylist();
    }

    syncPlaylist() {
        this.channel.emit('sync:playlist', this.playlist?.getSyncData());
    }

    /** /Playlist */

    syncOptions(target: BroadcastOperator | Socket = this.channel) {
        target.emit('sync:options', this.options);
    }

    syncStatus() {
        this.channel.emit('sync:status', this.status);
    }

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

    static getDefaultOptions(): RoomOptions {
        return {
            numberOfRounds: 10,
            secondsPerRound: 15,
            guessMode: RoomGuessMode.Both,
            showGuessesPreview: false
        }
    }

    getSyncData(): RoomSync {
        return {
            code: this.code,
            options: this.options,
            leader: this.leader.nickname,
            players: this.playersArray.map(player => player.getSyncData()),
            status: this.status,
            playlist: this.playlist?.getSyncData(),
            currentRound: this.currentRound?.getSyncData()
        }
    }


}