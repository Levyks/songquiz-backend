import { Room } from '.';
import { Track, Results } from "../typings";
import { singleRandom } from '../misc';

import Player from './player';
import { SongQuizError } from '../misc/errors';
import { BroadcastOperator } from 'typings/socket';
import { GuessEventComponent, RoundEventComponent } from 'typings/eventsComponents';

export enum RoundType {
    Song = 'song',
    Artist = 'artist',
}

const MS_CLOSING_MARGIN = 1000;
const MS_BEFORE_RESULTS = 3000;
const MS_COUNTDOWN_STEP = 100;

export default class Round {

    public choices: Track[];
    public correctAnswer: Track;
    public correctAnswerIdx: number;
    public type: RoundType = RoundType.Song;

    public remainingTime: number;
    public countdown: NodeJS.Timeout;
    public acceptingAnswers: boolean = false;
    public results?: Results;
    public emit: BroadcastOperator['emit'];

    public answers: {
        [nickname: string]: {
            choice: number,
            correct: boolean,
            score: number
        }
    } = {};

    get remainingTimeInSeconds(): number {
        return (this.remainingTime * MS_COUNTDOWN_STEP) / 1000;
    }

    constructor(
        public room: Room,
        public number: number
    ) {
        this.emit = room.emit;
        this.choices = room.playlist!.getRandomTracks(4);
        this.correctAnswer = singleRandom(this.choices);
        this.correctAnswerIdx = this.choices.indexOf(this.correctAnswer);
        room.playlist!.removeTrack(this.correctAnswer);
    }

    start() {
        this.remainingTime = this.room.options.secondsPerRound * (1000 / MS_COUNTDOWN_STEP);
        this.acceptingAnswers = true;
        this.countdown = setInterval(() => {
            this.remainingTime--;
            if (this.remainingTime <= 0) {
                clearInterval(this.countdown);
                setTimeout(() => this.close(), MS_CLOSING_MARGIN);
            }
        }, MS_COUNTDOWN_STEP);

        this.emit('round:started', {
            number: this.number,
            type: this.type,
            choices: this.choices.map(choice => choice.name),
            remainingTime: this.remainingTimeInSeconds,
            audioUrl: this.correctAnswer.preview,
            isLastRound: this.room.isLastRound(this)
        });
    }

    close() {
        this.acceptingAnswers = false;
        this.emit('round:closed', {
            correctAnswer: this.correctAnswerIdx
        });
        setTimeout(() => this.end(), MS_BEFORE_RESULTS);
    }

    end() {
        this.results = Object.entries(this.answers)
            .filter(([_, answer]) => answer.correct)
            .map(([nickname, answer]) => ({
                nickname,
                score: answer.score
            }))
            .sort((a, b) => b.score - a.score);
        this.room.handleRoundEnded(this);
    }

    getScore(): number {
        return Math.round((this.remainingTimeInSeconds/this.room.options.secondsPerRound) * 50) + 50;
    }

    hasAnswered(player: Player): boolean {
        return !!this.answers[player.nickname];
    }

    handleAnswer(player: Player, answer: number) {

        if (!this.acceptingAnswers) {
            throw new SongQuizError('errors.round.notAccepting');
        }

        if (this.hasAnswered(player)) {
            throw new SongQuizError('errors.round.alreadyAnswered');
        }

        if (!this.choices[answer]) {
            throw new SongQuizError('errors.round.invalidAnswer');
        }

        const correct = this.choices[answer].id === this.correctAnswer.id;

        this.answers[player.nickname] = {
            choice: answer,
            correct,
            score: correct ? this.getScore() : 0
        }
        
        console.log(this.answers);
    }

    getGuesses(): GuessEventComponent[] {
        return this.room.options.showGuessesPreview ?
            Object.entries(this.answers).map(([ nickname, answer ]) => ({
                nickname,
                answer: answer.choice,
            })) : [];
    }

    getSyncData(player: Player): RoundEventComponent {
        return {
            number: this.number,
            type: this.type,
            choices: this.choices.map(choice => choice.name),
            audioUrl: this.correctAnswer.preview,
            remainingTime: Math.max(this.remainingTimeInSeconds, 0),
            acceptingAnswers: this.acceptingAnswers,
            hasAnswered: this.hasAnswered(player),
            correctAnswer: this.acceptingAnswers ? undefined : this.correctAnswerIdx,
            results: this.results,
            isLastRound: this.room.isLastRound(this),
            guesses: this.getGuesses(),
        }
    }

}