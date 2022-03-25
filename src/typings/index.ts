import { RoomGuessMode } from "../classes/room";

export interface Artist {
    name: string,
    url: string,
}

export interface Track {
    id: string,
    name: string,
    artists: Artist[],
    cover: string,
    url: string,
    preview: string
}

export interface RoomOptions {
    numberOfRounds: number,
    secondsPerRound: number,
    guessMode: RoomGuessMode,
    showGuessesPreview: boolean,
}

export interface Callback<R> {
    (err?: Error, result?: R): void;
}