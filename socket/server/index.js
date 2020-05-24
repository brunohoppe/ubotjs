const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);


// let config = {
//   balance: 0,
//   status: "Parado",
//   statusColor: "red",
//   executar: "Não",
//   executarColor: "red"
// }
let users = 0
const run = (ubot) => {
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
      });
      io.on('connection', (socket) => {
        users += 1
        console.log('connected: ', users);
        // io.emit('botstatusrequest')
        socket.on("message", (msg) => {
          console.log(msg)
        })
        // Emissão para o Front
        // socket.on('botstatusresponse', (msg) => {
        //   config.balance = msg.currentBalance
        //   config.status = msg.rodarBot ? "Rodando" : "Parado"
        //   config.statusColor = msg.rodarBot ? "green" : "red"
        //   config.executar = msg.podeExecutar ? "Sim" : "Não"
        //   config.executarColor = msg.podeExecutar ? "green" : "red"
        //   io.emit('config', config)
        // });
        // socket.on('balance', (msg) => {
        //   config.balance = msg
        //   io.emit('balance', msg)
        // });
        socket.on('rodando', (msg) => {
          io.emit('balance', msg)
          io.emit('rodando', new Date().getTime())

        });
        socket.on('balance', (msg) => {
          console.log("Balance: ", msg)
        });
        // socket.on('trades', (trades) => {
        //   io.emit('trades', trades)
        // });
        // Emissão para o bot
        // socket.on('status', (msg) => {
        //   io.emit('botstatusrequest')
        // });
        // socket.on('rodar', () => {
        //   io.emit('rodar')
        // })
        // socket.on('parar', () => {
        //   io.emit('parar')
        // })
        // socket.on('executar', (msg) => {
        //   io.emit('executar', msg)
        // })
        
        socket.on('disconnect', () => {
          users -= 1
          console.log('connected: ', users);
        });
      });
      http.listen(3000, '0.0.0.0' , () => {
        console.log('listening on *:3000');
      });
}
exports.run = run