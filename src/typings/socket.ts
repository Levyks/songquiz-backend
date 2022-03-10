import { Player, Room } from "classes";
import { RoomSync, PlayerSync, PlaylistSync, PlaylistSource } from "./messages";
import SocketIO from "socket.io";

export interface ServerToClientEvents {
    'sync:room': (data: RoomSync) => void,
    'sync:player': (data: PlayerSync) => void,
    'sync:players': (data: PlayerSync[]) => void,
    'delete:player': (nickname: string) => void,
    'sync:playlist': (data: PlaylistSync | undefined) => void
    'sync:leader': (nickname: string) => void
}

export interface ClientToServerEvents {
    'set:playlist': (data: PlaylistSource, callback: (err?: any) => void) => void,
}

export interface InterServerEvents {}

export interface SocketData {
    player: Player,
    room: Room
}

export type Server = SocketIO.Server<ClientToServerEvents, ServerToClientEvents , InterServerEvents, SocketData>;
export type Socket = SocketIO.Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type BroadcastOperator = SocketIO.BroadcastOperator<ServerToClientEvents, SocketData>;