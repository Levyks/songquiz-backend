import { RoomGuessMode } from "../classes/room";

export type Artist = {
    name: string,
    url: string,
}

export type Track = {
    id: string,
    name: string,
    artists: Artist[],
    cover: string,
    url: string,
    preview: string
}

export type RoomOptions = {
    numberOfRounds: number,
    secondsPerRound: number,
    guessMode: RoomGuessMode,
    showGuessesPreview: boolean,
}

export type Results = {
    nickname: string,
    score: number
}[];

