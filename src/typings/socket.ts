import { Player } from "../classes";
import Room from "../classes/room";
import SocketIO from "socket.io";
import { GameStartingEvent, OptionsUpdatedEvent, PlayerJoinedEvent, PlaylistUpdatedEvent, RoomSyncEvent, RoundClosedEvent, RoundEndedEvent, RoundGuessesEvent, RoundGuessEvent, RoundStartedEvent, SetOptionsEvent, SetPlaylistEvent } from "./events";

type Callback<R> = {
    (err?: Error, result?: R): void;
}

export type ServerToClientEvents = {
    'room:sync': (data: RoomSyncEvent) => void,

    'game:starting': (data: GameStartingEvent) => void,
    'round:started': (data: RoundStartedEvent) => void,
    'round:guess': (data: RoundGuessEvent) => void,
    'round:guesses': (data: RoundGuessesEvent) => void,
    'round:closed': (data: RoundClosedEvent) => void,
    'round:ended': (data: RoundEndedEvent) => void,
    'game:ended': () => void,

    'options:updated': (data: OptionsUpdatedEvent) => void,
    'playlist:updated': (data: PlaylistUpdatedEvent) => void

    'room:leaderChanged': (nickname: string) => void,

    'player:joined': (data: PlayerJoinedEvent) => void,
    'player:connected': (nickname: string) => void,
    'player:disconnected': (nickname: string) => void,
    'player:left': (nickname: string) => void,
}

export type ClientToServerEvents = {
    'playlist:set': (data: SetPlaylistEvent, callback: Callback<void>) => void,
    'options:set': (data: SetOptionsEvent, callback: Callback<void>) => void,

    'game:start': (callback: Callback<void>) => void,
    'round:guess': (answer: number, callback: Callback<void>) => void,
}

export type InterServerEvents = {}

export type SocketData = {
    player: Player,
    room: Room
}

export type Server = SocketIO.Server<ClientToServerEvents, ServerToClientEvents , InterServerEvents, SocketData>;
export type Socket = SocketIO.Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type BroadcastOperator = SocketIO.BroadcastOperator<ServerToClientEvents, SocketData>;