
export interface Artist {
    name: string,
    url: string,
}

export interface Track {
    name: string,
    artists: Artist[],
    cover: string,
    url: string,
    preview: string
}