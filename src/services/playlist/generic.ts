import { Playlist } from '../../classes';

abstract class PlaylistService {
    abstract fetchPlaylist(id: string): Promise<Playlist>
}

export default PlaylistService;