import { RoomStatus } from "../classes/room";
import { PlaylistType } from "../classes/playlist";

export interface RoomSync {
    code: string,
    leader: string,
    players: PlayerSync[],
    status: RoomStatus,
    playlist?: PlaylistSync
}

export interface PlayerSync {
    nickname: string,
    color: [number, number, number],
    connected: boolean,
    score: number,
}

export interface PlaylistSync {
    name: string,
    type: PlaylistType,
    total_tracks_count: number,
    valid_tracks_count: number,
    cover: string,
    url: string
}

export interface PlaylistSource {
    type: PlaylistType,
    id: string
}