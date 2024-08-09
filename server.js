const express = require("express"); // pobieramy klase express do serwera www
const socketio = require("socket.io"); // import biblioteki socketio
// const moment = require('moment');
require("dotenv").config();

// const moment = require('moment'); Baza danych

let fs = require("fs");
let https = require("https");
let privateKey = fs.readFileSync("key.key", "utf8");
let certificate = fs.readFileSync("key.crt", "utf8");

let credentials = { key: privateKey, cert: certificate };

const app = express(); // pobieram instancje serwera

let server = https.createServer(credentials, app);

// definiuje statyczny katalog na pliki, dostępny w sieci
app.use(express.static(__dirname + "/public"));

// otwieramy port 80 dla serwera WWW
server.listen(process.env.porthttps, () => {
  console.log("serwer start: https://localhost:" + process.env.porthttps + "/");
});

// dodanie soketów do komunikacji online
const io = socketio(server, {
  // zgoda na komunikacje z innych adresów internetoweych cors(GET, POST)
  cors: {
    origin: "*", // adresy dozwolone
    methods: ["GET", "POST"], // metody komunikacji
    credentials: true,
  },
});

let clientDB = {};

const offsetMap = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

// CID('idsoketu') z ClientDB.filter(e=>e.socketid == 'idsoketu')[0]
const CID = (socketid) => clientDB.filter((e) => e.socketid == socketid)[0];
const KID = (idKlienta) => clientDB.filter((e) => e.id == idKlienta)[0];
// function CID1(socketid){
//     return ClientDB.filter(e=>e.socketid == socketid)[0];
// }

function findClientById(socketList, clientId) {
  for (const [socketId, socket] of socketList.entries()) {
    if (socket.data.clientId === clientId) {
      return socket;
    }
  }
  return null; // Zwróć null, jeśli klient o danym id nie został znaleziony
}

io.on("connection", (client) => {
  console.log("Klient nawiązał połączenie", client.id);

  
  if(!(client.id in clientDB)) {
    clientDB = {...clientDB, [client.id]: 
      {
      map: [],
      number_flags: 0,
      number_hidden_fields: 0, 
      },
    }
  }

  client.on("initMap", (map) => {
    clientDB[client.id].map = map;
    io.sockets.emit("loadMap", clientDB[client.id].map);
  });

  client.on("initMine", (numberMine, field_ignored, callaback) => {
    const sizeX = clientDB[client.id].map[0].length;
    const sizeY = clientDB[client.id].map.length;
  
    while (numberMine > 0) {
      const x = Math.floor(Math.random() * sizeX);
      const y = Math.floor(Math.random() * sizeY);
  
      //console.log(field_ignored.filter(e=>e==[y,x]));
      if (
        !clientDB[client.id].map[y][x].mine &&
        field_ignored.filter((e) => e[0] == y && e[1] == x).length == 0
      ) {
        clientDB[client.id].map[y][x].mine = true;
        numberMine--;
        offsetMap.forEach((off) => {
          const chech_Y = y + off[0];
          const chech_X = x + off[1];
      
          if (chech_X >= 0 && chech_Y >= 0 && chech_X < sizeX && chech_Y < sizeY) {
            clientDB[client.id].map[chech_Y][chech_X].closer_mine++;
          }
        });
      }
    }
    // console.log(clientDB[client.id].map);
    callaback(clientDB[client.id].map)
    //io.sockets.emit("loadMap", clientDB[client.id].map);
  });
});

/**
 * funkcja licznika odwiedzin dostępna pod adresem http://host/licznik
 *
 * @param {Request} - dane które przychodzą
 * @param {Response} - dane wyjściowe
 */
app.get("/licznik", (req, resp) => {
  // odpowiedź serwera z json, w nim liczba odwiedzin od startu serwera
  //resp.send({ licznik: ++LicznikOdw });
});
