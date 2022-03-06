import { createStore } from 'tepkijs';
import { Room } from './classes';
import { io } from './server';
import playlistServices from './services/playlist';

function createRoomStore(room: Room) {
    return createStore({
        io, name: room.code,
        data: room,
        methods: {
            async setPlaylist(socket, type: string, id: string) {
                const { player } = socket.data;
                if(this.leader !== player.nickname) {
                    throw new Error('Only the leader can set the playlist');
                }
                
                const playlistService = playlistServices[type];
                if(!playlistService) {
                    throw new Error(`Unknown playlist service: ${type}`);
                }
                
                this.playlist = await playlistService.fetchPlaylist(id);
                console.log('Playlist set', this.playlist);
            }
        },
        middleware: (socket, next) => {
            const { nickname, token } = socket.handshake.auth;
            const player = room.players[nickname];
            
            if(!player || player._token !== token) {
                next(new Error('Unauthorized'));
                return;   
            }
    
            player.setSocket(socket);
    
            next();
        }
    });
}

export {
    createRoomStore
}