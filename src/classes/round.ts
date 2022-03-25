import { Room } from '.';
import { Track } from "../typings";
import { singleRandom } from '../misc';

import { RoundSync } from 'typings/messages';


export enum RoundType {
    Song = 'song',
    Artist = 'artist',
}

export default class Round {

    public choices: Track[];
    public correctAnswer: Track;
    public type: RoundType = RoundType.Song;

    public remainingTime = 15;
    public countdownInterval: NodeJS.Timeout;

    constructor(
        public room: Room,
        public number: number
    ) {
        this.choices = room.playlist!.getRandomTracks(4);
        this.correctAnswer = singleRandom(this.choices);
        room.playlist!.removeTrack(this.correctAnswer);
    }

    start() {
        this.countdownInterval = setInterval(() => {
            this.remainingTime--;
            if (this.remainingTime <= 0) {
                this.end();
            }
        }, 1000);
        this.sync();
    }

    end() {
        clearInterval(this.countdownInterval);
    }

    sync() {
        this.room.channel.emit('sync:round', this.getSyncData());
    }

    getSyncData(): RoundSync {
        return {
            type: this.type,
            choices: this.choices.map(choice => choice.name),
            audio: this.correctAnswer.preview,
            remainingTime: this.remainingTime,
        }
    }

}