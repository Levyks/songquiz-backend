import PlaylistService from "./generic";
import SpotifyService from "./spotify";

const instances: {
    [key: string]: PlaylistService
} = {
    spotify: new SpotifyService()
};

export default instances;
