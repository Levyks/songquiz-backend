import { Playlist } from '../../typings';

abstract class PlaylistService {
    abstract fetchPlaylist(id: string): Promise<Playlist>
}

export default PlaylistService;