import { Player } from "./classes";
import { Server, Socket } from "./typings/socket";
import { SongQuizError } from "./misc/errors"; 
import { validateOptions, validatePlaylistSource } from "./misc/validation";
import Room, { RoomStatus } from "./classes/room";

export function registerIOHandlers(io: Server) {
    io.use(middleware);
    io.on('connection', handleConnection);
}

async function middleware(socket: Socket, next: (err?: Error) => void) {

    const { roomCode, nickname, token } = socket.handshake.auth;
        
    if(!roomCode) return next(new Error('Room code not provided'));

    const room = Room.rooms[roomCode];
    if(!room) return next(new Error('Room not found'));
    
    const player = room.players[nickname];
    if(!player || player.token !== token) {
        return next(new Error('Unauthorized'));   
    }

    socket.data.player = player;
    socket.data.room = room;

    next();

}

function handleConnection(socket: Socket) {

    const { player, room } = socket.data;

    if(!player || !room) return socket.disconnect(true);

    player.socket = socket;
    
    socket.on('disconnect', () => {
        console.log(`${player.nickname} disconnected`);
        player.disconnectionTimeout = setTimeout(() => {
            room.handleDisconnection(player);
        }, Player.delayBeforeDisconnection);
        room.syncPlayer(player);
    });

    socket.on('set:playlist', (source, callback) => {

        if(!room.isLeader(player)) {
            return callback(new SongQuizError("errors.onlyLeader"));
        }

        const invalidParams = validatePlaylistSource(source);
        if(invalidParams.length) {
            return callback(new SongQuizError("errors.invalidPlaylistSource", {
                invalidParams: invalidParams.join(', ')
            }));
        }

        return room.fetchPlaylist(source)
            .then(() => callback())
            .catch((err: SongQuizError) => {
                if(err.isSongQuizError) return callback(err);
                return callback(SongQuizError.unknown);
            });
    });

    socket.on('set:options', (options, callback) => {

        if(!room.isLeader(player)) {
            room.syncOptions(player.socket);
            return callback(new SongQuizError("errors.onlyLeader"));
        }

        const invalidParams = validateOptions(options);
        if(invalidParams.length) {
            return callback(new SongQuizError("errors.invalidOptions", {
                invalidParams: invalidParams.join(', ')
            }));
        }

        room.options = options;
        room.syncOptions();

        callback();
    });

    socket.on('start:game', (callback) => {

        if(!room.isLeader(player)) {
            room.syncOptions(player.socket);
            return callback(new SongQuizError("errors.onlyLeader"));
        }

        if(room.status !== RoomStatus.Lobby) {
            return callback(new SongQuizError("errors.alreadyStarted"));
        }

        room.startGame();
        callback();

    });

    socket.emit('sync:room', room.getSyncData());

    if(player.disconnectionTimeout) {
        console.log(`canceling disconnection timeout for ${player.nickname}`);
        clearTimeout(player.disconnectionTimeout);
        player.disconnectionTimeout = undefined;
    }

    room.syncPlayer(player);

    socket.join(room.code);

}