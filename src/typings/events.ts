import { RoomStatus } from "classes/room";
import { RoundType } from "classes/round";
import { RoomOptions } from "typings";
import { 
    GuessEventComponent, 
    PlayerEventComponent, 
    PlaylistEventComponent, 
    ResultsEventComponent, 
    RoundEventComponent 
} from "./eventsComponents";
import { PlaylistSource } from "./messages";

// <ServerToClientEvents>

export type GameStartingEvent = {
    startsIn: number;
}

export type RoundStartedEvent = {
    number: number,
    type: RoundType,
    choices: string[],
    remainingTime: number,
    audioUrl: string,
    isLastRound: boolean
}

export type RoundGuessEvent = GuessEventComponent;
export type RoundGuessesEvent = GuessEventComponent[];

export type RoundClosedEvent = {
    correctAnswer: number,
}

export type RoundEndedEvent = {
    results: ResultsEventComponent,
    nextRoundStartsIn: number,
}

export type RoomSyncEvent = {
    code: string,
    options: RoomOptions,
    leader: string,
    players: PlayerEventComponent[],
    status: RoomStatus,
    playlist?: PlaylistEventComponent
    currentRound?: RoundEventComponent
}

export type PlayerJoinedEvent = PlayerEventComponent;

export type OptionsUpdatedEvent = RoomOptions;
export type PlaylistUpdatedEvent = PlaylistEventComponent;

// </ServerToClientEvents>

// <ClientToServerEvents>

export type SetPlaylistEvent = PlaylistSource;
export type SetOptionsEvent = RoomOptions;

// </ClientToServerEvents>