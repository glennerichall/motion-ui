const socket = require('socket.io');

class PubSub {
    init(server) {
        this.io = socket(server);
        this.io.on('connection', this.connection);
    }

    connection = client => {
        console.log(`Websocket connection : ${client.id}`);
    }

    emit(event, payload) {
        this.io.emit(event, payload);
    }
}

module.exports = new PubSub();