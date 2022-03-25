import { Player } from "../classes";
import Room, { RoomStatus } from "../classes/room";
import { RoomSync, PlayerSync, PlaylistSync, PlaylistSource, RoundSync } from "./messages";
import SocketIO from "socket.io";
import { RoomOptions, Callback } from ".";

export interface ServerToClientEvents {
    'sync:room': (data: RoomSync) => void,
    'sync:player': (data: PlayerSync) => void,
    'sync:players': (data: PlayerSync[]) => void,
    'sync:round': (data: RoundSync) => void,
    'sync:status': (data: RoomStatus) => void,
    'sync:playlist': (data: PlaylistSync | undefined) => void
    'sync:leader': (nickname: string) => void,
    'sync:options': (options: RoomOptions) => void,
    'delete:player': (nickname: string) => void,
}

export interface ClientToServerEvents {
    'set:playlist': (data: PlaylistSource, callback: Callback<void>) => void,
    'set:options': (data: RoomOptions, callback: Callback<void>) => void,
    'start:game': (callback: Callback<void>) => void,
}

export interface InterServerEvents {}

export interface SocketData {
    player: Player,
    room: Room
}

export type Server = SocketIO.Server<ClientToServerEvents, ServerToClientEvents , InterServerEvents, SocketData>;
export type Socket = SocketIO.Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type BroadcastOperator = SocketIO.BroadcastOperator<ServerToClientEvents, SocketData>;