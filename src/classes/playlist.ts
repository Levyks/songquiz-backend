
import { multipleRandom } from '../misc';
import { Track } from "../typings";
import { PlaylistSource } from "../typings/messages";
import playlistServices from '../services/playlist';
import { SongQuizError } from "../misc/errors";
import { PlaylistEventComponent } from 'typings/eventsComponents';

export enum PlaylistType {
    Spotify = 'spotify'
}

export default class Playlist {

    playable_tracks_count: number;
    tracks: { [id: string]: Track }

    constructor(
        public name: string,
        public creator: string,
        public type: PlaylistType,
        public total_tracks_count: number,
        tracks: Track[],
        public cover: string,
        public url: string,
    ) {
        this.playable_tracks_count = tracks.length;
        this.tracks = tracks.reduce((acc, track) => {
            acc[track.id] = track;
            return acc;
        }, {});
    }

    get remaining_playable_tracks_count(): number {
        return Object.values(this.tracks).length;
    }

    getSyncData(): PlaylistEventComponent {
        return {
            name: this.name,
            creator: this.creator,
            type: this.type,
            total_tracks_count: this.total_tracks_count,
            playable_tracks_count: this.playable_tracks_count,
            remaining_playable_tracks_count: this.remaining_playable_tracks_count,
            cover: this.cover,
            url: this.url,   
        }
    }

    getRandomTracks(count: number): Track[] {
        const tracks = Object.values(this.tracks);
        return multipleRandom(tracks, count);
    }

    removeTrack(track: Track) {
        delete this.tracks[track.id];
    }

    static fetch(source: PlaylistSource): Promise<Playlist> {
        const service = playlistServices[source.type];

        if(!service) {
            return Promise.reject(new SongQuizError("errors.playlist.unknownSource", { source: source.type }));
        }

        return service.fetchPlaylist(source.id);
    }

}