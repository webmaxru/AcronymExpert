console.log("Server started");
/*
var Msg = '';
var WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({port: 8010});
    wss.on('connection', function(ws) {
        ws.on('message', function(message) {
        console.log('Received from client: %s', message);
        ws.send('Server received from client: ' + message);
    });
 });

*/
 const WebSocket = require('ws');

 const wss = new WebSocket.Server({ port: 8010 });

 function heartbeat() {
   this.isAlive = true;
 }

 wss.on('connection', function connection(ws) {
   ws.isAlive = true;
   ws.on('pong', heartbeat);
   ws.on('message', function(message) {
    console.log('Received from client: %s', message);
    ws.send('Server received from client: ' + message);
    });
 });

 const interval = setInterval(function ping() {
   wss.clients.forEach(function each(ws) {
     if (ws.isAlive === false) return ws.terminate();

     ws.isAlive = false;
     ws.ping('', false, true);
   });
 }, 30000);