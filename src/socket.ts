import { Room } from "./classes";
import { Server, Socket } from "./typings/socket";
import { SongQuizError } from "./misc/errors";

export function registerIOHandlers(io: Server) {
    io.use(middleware);
    io.on('connection', handleConnection);
}

function middleware(socket: Socket, next: (err?: Error) => void) {

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

    socket.join(room.code);
    
    socket.on('disconnect', () => {
        room.handleDisconnection(player);
    });

    socket.on('set:playlist', (source, callback) => {

        if(!room.isLeader(player)) {
            return callback(new SongQuizError("errors.playlist.onlyLeader"));
        }

        return room.fetchPlaylist(source)
            .then(() => callback())
            .catch((err: SongQuizError) => {
                if(err.isSongQuizError) return callback(err);
                return callback(SongQuizError.unknown);
            });
    });

    socket.emit('sync:room', room.getSyncData());

}