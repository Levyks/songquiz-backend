
import { Player, Playlist, Round } from '.';

import { BroadcastOperator, Server } from '../typings/socket';
import { PlayerSync, PlaylistSource, RoomSync } from "../typings/messages";
import { Results, RoomOptions } from 'typings';
import { RoomSyncEvent } from 'typings/events';

const MAX_AMOUNT_OF_TRIES_CODE_GENERATION = 50000;
const CODE_SIZE = 4;

const MS_BEFORE_STARTING = 3000;
const MS_BETWEEN_ROUNDS = 10000;

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
    emit: BroadcastOperator['emit'];

    nextRoundStartsIn: number;

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
        this.emit = this.channel.emit.bind(this.channel);
        this.addPlayer(leader);
    }

    startGame() {

        this.rounds = [];
        this.currentRoundIdx = 0;

        for (let i = 1; i <= this.options.numberOfRounds; i++) {
            this.rounds.push(new Round(this, i));
        }

        this.status = RoomStatus.Starting;
        this.channel.emit('game:starting', {
            startsIn: Math.floor(MS_BEFORE_STARTING / 1000)
        });

        this.scheduleNextRoundStart(MS_BEFORE_STARTING);

    }

    scheduleNextRoundStart(delay_in_ms: number) {
        
        this.nextRoundStartsIn = Math.floor(delay_in_ms / 1000);

        const countdown = setInterval(() => {
            if(this.nextRoundStartsIn > 0) {
                this.nextRoundStartsIn--;
            } else {
                clearInterval(countdown);
            }
        }, 1000);
        
        setTimeout(() => {
            this.nextRoundStartsIn = 0;
            this.startNextRound();
        }, delay_in_ms);
    }

    startNextRound() {
        this.currentRoundIdx++;
        this.currentRound!.start();
    }

    handleRoundEnded(round: Round) {
        this.updateScoresFromResults(round.results!);

        this.channel.emit('round:ended', {
            results: round.results!,
            nextRoundStartsIn: MS_BETWEEN_ROUNDS
        });

        if(this.isLastRound(round)) {
            this.status = RoomStatus.Finished;
        } else {
            this.scheduleNextRoundStart(MS_BETWEEN_ROUNDS);
        }
    }

    updateScoresFromResults(results: Results) {
        results.forEach(resultEntry => {
            this.players[resultEntry.nickname].score += resultEntry.score;
        });
    }

    isLastRound(round: Round): boolean {
        return this.currentRoundIdx === this.rounds!.length - 1;
    }

    /** Players */

    setLeader(player: Player) {
        if(!this.players[player.nickname]) this.addPlayer(player);
        this.leader = player;
        this.emit('room:leaderChanged', player.nickname);
    }

    isLeader(player: Player) {
        return this.leader.nickname === player.nickname;
    }

    addPlayer(player: Player) {
        if(!this.players[player.nickname]) {
            player.room = this;
            this.players[player.nickname] = player;
            this.emit('player:joined', player.getSyncData());
        }
    }

    removePlayer(player: Player) {
        if(this.players[player.nickname]) {
            delete this.players[player.nickname];
            this.emit('player:left', player.nickname);
        }
    }

    handleDisconnection(player: Player) {
        //this.removePlayer(player);
        this.emit('player:disconnected', player.nickname);
    }

    getPlayersSyncData(): PlayerSync[] {
        return this.playersArray.map(player => player.getSyncData());
    }

    getScoresSyncData(): { [nickname: string]: number } {
        return this.playersArray.reduce((acc, player) => {
            acc[player.nickname] = player.score;
            return acc;
        }, {});
    }

    /** /Players */

    /** Playlist */

    fetchPlaylist(source: PlaylistSource): Promise<void> {
        return Playlist.fetch(source)
            .then(this.setPlaylist.bind(this));
    }

    setPlaylist(playlist: Playlist) {
        this.playlist = playlist;
        this.syncPlaylist();
    }

    syncPlaylist() {
        this.channel.emit('playlist:updated', this.playlist!.getSyncData());
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

    static getDefaultOptions(): RoomOptions {
        return {
            numberOfRounds: 10,
            secondsPerRound: 15,
            guessMode: RoomGuessMode.Both,
            showGuessesPreview: false
        }
    }

    getSyncData(player: Player): RoomSyncEvent {
        return {
            code: this.code,
            options: this.options,
            leader: this.leader.nickname,
            players: this.playersArray.map(player => player.getSyncData()),
            status: this.status,
            playlist: this.playlist?.getSyncData(),
            currentRound: this.currentRound?.getSyncData(player)
        }
    }


}