
interface ExternalUrls {
    [key: string]: string;
}

interface Image {
    url: string,
    width: number,
    height: number,
}

export interface PlaylistResponse {
    name: string,
    owner: {
        display_name: string
    },
    external_urls: ExternalUrls,
    images: Image[],
    tracks: {
        total: number
    }
}

export interface TracksResponse {
    items: {
        track: {
            id: string,
            name: string,
            preview_url: string,
            external_urls: ExternalUrls,
            artists: {
                external_urls: ExternalUrls,
                name: string
            }[],
            album: {
                images: Image[],
            }
        }
    }[],
    total: number
}