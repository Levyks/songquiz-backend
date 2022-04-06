import { RoomStatus } from "../classes/room";
import { PlaylistType } from "../classes/playlist";
import { RoundType } from "../classes/round";
import { RoomOptions, Results } from "typings";

export type RoomSync = {
    code: string,
    options: RoomOptions,
    leader: string,
    players: PlayerSync[],
    status: RoomStatus,
    playlist?: PlaylistSync,
    currentRound?: RoundSync,
}

export type PlayerSync = {
    nickname: string,
    color: [number, number, number],
    connected: boolean,
    score: number,
}

export type PlaylistSync = {
    name: string,
    creator: string,
    type: PlaylistType,
    total_tracks_count: number,
    playable_tracks_count: number,
    remaining_playable_tracks_count: number,
    cover: string,
    url: string
}

export type RoundSync = {
    number: number,
    choices: string[],
    audio: string,
    type: RoundType,
    remainingTime: number,
    acceptingAnswers: boolean,
    hasAnswered: boolean,
    correctAnswer?: number,
    results?: Results
    
}

export type TrackSync = {
    name: string,
    cover: string,
    url: string,
    artists: ArtistSync[]
}

export type ArtistSync = {
    name: string
    url: string
}

export type PlaylistSource = {
    type: PlaylistType,
    id: string
}