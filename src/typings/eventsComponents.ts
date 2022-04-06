import { PlaylistType } from "../classes/playlist";
import { RoundType } from "../classes/round";

export type RoundEventComponent = {
    number: number,
    choices: string[],
    type: RoundType,
    remainingTime: number,
    audioUrl: string,
    acceptingAnswers: boolean,
    hasAnswered: boolean,
    isLastRound: boolean,
    guesses: GuessEventComponent[],
    correctAnswer?: number,
    results?: ResultsEventComponent,
}

export type GuessEventComponent = {
    nickname: string,
    answer: number
};

export type ResultsEventComponent = {
    nickname: string,
    score: number
}[];

export type PlayerEventComponent = {
    nickname: string,
    color: [number, number, number],
    connected: boolean,
    score: number,
}

export type PlaylistEventComponent = {
    name: string,
    creator: string,
    type: PlaylistType,
    total_tracks_count: number,
    playable_tracks_count: number,
    remaining_playable_tracks_count: number,
    cover: string,
    url: string
}