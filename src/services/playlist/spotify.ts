
import axios, { AxiosError } from 'axios';

import PlaylistService from './generic';

import { attempt } from '../../misc';

import Playlist, { PlaylistType } from '../../classes/playlist';

import { Track } from '../../typings';
import { PlaylistResponse, TracksResponse } from '../../typings/spotify';

const TRACKS_PAGE_SIZE = 100;

export default class SpotifyService extends PlaylistService {

    private fetchAccessTokenPromise: Promise<string> | null;
    private token: string | null = process.env.SPOTIFY_TOKEN || null;

    async fetchPlaylist(id: string): Promise<Playlist> {
    
        const fields = encodeURIComponent('name,owner(display_name),external_urls(spotify),images,tracks(total)');
    
        const [playlist, tracks] = await Promise.all([
            this.getRequest(`playlists/${id}?fields=${fields}`) as Promise<PlaylistResponse>,
            this.fetchPlaylistTracks(id)
        ]);
        
        return new Playlist(
            playlist.name,
            playlist.owner.display_name,
            PlaylistType.Spotify,
            playlist.tracks.total,
            tracks,
            playlist.images[0].url,
            playlist.external_urls.spotify
        )
    }

    async fetchPlaylistTracks(id: string, fetch_all: boolean = true, offset: number = 0): Promise<Track[]> {
        
        const fields = encodeURIComponent('items(track(id, name, preview_url, external_urls, artists(external_urls,name), album(images))),total');
        
        const response: TracksResponse = await this.getRequest(`playlists/${id}/tracks?offset=${offset}&limit=${TRACKS_PAGE_SIZE}&fields=${fields}`);
    
        const tracks = response.items.filter(item => item.track.preview_url).map<Track>(item => ({
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists.map(artist => ({
                name: artist.name,
                url: artist.external_urls.spotify
            })),
            cover: item.track.album.images[0].url,
            url: item.track.external_urls.spotify,
            preview: item.track.preview_url
        }));

        /**
         * Using offset here instead of next because we can fetch all other pages simultaneously, making it faster
         */
        if(fetch_all && response.total > offset + tracks.length) {
            const offsets = Array.from({length: Math.ceil(response.total / TRACKS_PAGE_SIZE) - 1}, (_, i) => (i + 1) * TRACKS_PAGE_SIZE);

            const array_of_tracks = await Promise.all(
                offsets.map(offset => this.fetchPlaylistTracks(id, false, offset))
            );
            return tracks.concat(...array_of_tracks);
        }

        return tracks;
    }

    private async getRequest(endpoint: string, second_try: boolean = false): Promise<any> {

        if(!this.token) {
            await this.fetchAccessTokenNoRep();
        }
        
        return axios({
            method: 'get',
            baseURL: 'https://api.spotify.com/v1/',
            url: endpoint,
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        }).then(r => r.data).catch((err: AxiosError) => {
            if(err.response?.status === 401 && !second_try) {
                return this.fetchAccessTokenNoRep().then(() => this.getRequest(endpoint, true));
            }
            throw err;
        });
    }

    private fetchAccessToken(): Promise<string> {

        const basic_token = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
        return attempt(2, axios.post, 'https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${basic_token}` 
            }
        }).then(response => {
            const token: string = response.data.access_token;
            this.token = token;
            return token;
        });  
    }

    private fetchAccessTokenNoRep(): Promise<string> {

        if(this.fetchAccessTokenPromise) {
            return this.fetchAccessTokenPromise;
        }
    
        this.fetchAccessTokenPromise = this.fetchAccessToken().then((token) => {
            this.fetchAccessTokenPromise = null;   
            return token;
        });
    
        return this.fetchAccessTokenPromise;
    
    }
}
