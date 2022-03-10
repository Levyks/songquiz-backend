import { Track } from "../typings";
import { PlaylistSource, PlaylistSync } from "../typings/messages";
import playlistServices from '../services/playlist';
import { SongQuizError } from "misc/errors";

export enum PlaylistType {
    Spotify = 'spotify'
}

export default class Playlist {

    constructor(
        public name: string,
        public type: PlaylistType,
        public total_tracks_count: number,
        public tracks: Track[],
        public cover: string,
        public url: string,
    ) {}

    get valid_tracks_count(): number {
        return this.tracks.length;
    }

    getSyncData(): PlaylistSync {
        return {
            name: this.name,
            type: this.type,
            total_tracks_count: this.total_tracks_count,
            valid_tracks_count: this.valid_tracks_count,
            cover: this.cover,
            url: this.url,   
        }
    }

    static fetch(source: PlaylistSource): Promise<Playlist> {
        const service = playlistServices[source.type];

        if(!service) {
            return Promise.reject(new SongQuizError("errors.playlist.unknownSource", { source: source.type }));
        }

        return service.fetchPlaylist(source.id);
    }

}