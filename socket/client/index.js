const io = require('socket.io-client');
const run = () => {
    const socket = io('http://localhost:3000');
    return socket
}

const socket = run()
exports.socket = socket
