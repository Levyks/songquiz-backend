
export type RoomStatus = 'lobby' | 'starting' | 'round' | 'finished';

export interface Artist {
    name: string,
    url: string,
}

export interface Track {
    name: string,
    artists: Artist[],
    cover: string,
    url: string,
    _preview: string
}

export interface Playlist {
    name: string,
    tracks_count: number,
    valid_tracks_count: number,
    _tracks: Track[],
    cover: string,
    url: string
}
