import { PlaylistType } from "../classes/playlist";
import { RoomGuessMode } from "../classes/room";
import { RoomOptions } from "../typings";
import { PlaylistSource } from "../typings/messages";

export function validateOptions(options: RoomOptions): string[] {

    const invalid: string[] = [];

    if(!options.guessMode || !Object.values(RoomGuessMode).includes(options.guessMode)) {
        invalid.push('guessMode');
    }

    if(!options.numberOfRounds || !(options.numberOfRounds >= 5 && options.numberOfRounds <= 20)) {
        invalid.push('numberOfRounds');
    }

    if(!options.secondsPerRound || !(options.secondsPerRound >= 5 && options.secondsPerRound <= 30)) {
        invalid.push('secondsPerRound');
    }
    
    if(typeof options.showGuessesPreview !== 'boolean') {
        invalid.push('showGuessesPreview');
    }

    return invalid;

}

export function validatePlaylistSource(source: PlaylistSource) {

    const invalid: string[] = [];

    if(!source.type || !Object.values(PlaylistType).includes(source.type)) {
        invalid.push('type');
    }

    if(!source.id || typeof source.id !== 'string') {
        invalid.push('id');
    }

    return invalid;

}