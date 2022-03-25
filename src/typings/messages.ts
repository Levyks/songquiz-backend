import { RoomStatus } from "../classes/room";
import { PlaylistType } from "../classes/playlist";
import { RoundType } from "../classes/round";
import { RoomOptions } from "typings";

export interface RoomSync {
    code: string,
    options: RoomOptions,
    leader: string,
    players: PlayerSync[],
    status: RoomStatus,
    playlist?: PlaylistSync,
    currentRound?: RoundSync,
}

export interface PlayerSync {
    nickname: string,
    color: [number, number, number],
    connected: boolean,
    score: number,
}

export interface PlaylistSync {
    name: string,
    creator: string,
    type: PlaylistType,
    total_tracks_count: number,
    playable_tracks_count: number,
    remaining_playable_tracks_count: number,
    cover: string,
    url: string
}

export interface RoundSync {
    choices: string[],
    audio: string,
    type: RoundType,
    remainingTime: number,
}

export interface TrackSync {
    name: string,
    cover: string,
    url: string,
    artists: ArtistSync[]
}

export interface ArtistSync {
    name: string
    url: string
}

export interface PlaylistSource {
    type: PlaylistType,
    id: string
}