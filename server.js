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

  client.on("updateMapElement", (x, y, key, value) => {
    clientDB[client.id].map[y][x][key] = value;
  });

  // client.on("showField123", (x, y, callaback) => {

  //   console.log("showField - start");

  //   const data = showField(x, y);

  //   console.log(data);

  //   callaback(data)
  // });
  
  // function showField(x, y, numberHiddenFields = 0, result = {}) {
  //   const field = clientDB[client.id].map[y][x];

  //     if (field.mine) {

  //       clientDB[client.id].map.forEach((y) => {
  //         y.forEach((e) => {
  //           if (e.mine && !e.marked) {
  //             result[e.field] = -1;
  //             // const element = document.getElementById(e.field);
  //             // element.classList.remove("hide");
  //             // element.classList.add("mine");
  //           }
  //         });
  //       });

  //       return {
  //         status: "lost",
  //         result: result
  //       }
  //     } else if (field.closer_mine == 0) {
  //       if (!field.show) {
  //         numberHiddenFields--;
  //       }
  //       field.show = true;
  //       // const element = document.getElementById(field.field);
  //       // element.classList.remove("hide");
  //       result[field.field] = 0;
    
  //       offsetMap.forEach((off) => {
  //         const chech_Y = y + off[0];
  //         const chech_X = x + off[1];
    
  //         if (
  //           chech_X >= 0 &&
  //           chech_Y >= 0 &&
  //           chech_X < sizeX &&
  //           chech_Y < sizeY
  //         ) {
  //           const local_field = clientDB[client.id].map[chech_Y][chech_X];
  //           if (local_field.closer_mine == 0 && !local_field.show && !local_field.marked) {
  //             const data = showField(chech_X, chech_Y, numberHiddenFields, result);
  //             result = {...result, ...data.result}
  //           }
  //           else if (!local_field.show) {
  //             numberHiddenFields--;
  //             local_field.show = true;
  //             result[local_field.field] = local_field.closer_mine;
  //             // const localElement = document.getElementById(local_field.field);
  //             // localElement.classList.add("mine" + local_field.closer_mine);
  //             // localElement.classList.remove("hide");
  //           }
  //         }
  //       });

  //       return {
  //         status: "play",
  //         result: result
  //       }
  //     } else {
  //       if (!field.show) {
  //         numberHiddenFields--;
  //         field.show = true;
  //         result[field.field] = field.closer_mine;
  //         // const element = document.getElementById(field.field);
  //         // element.classList.remove("hide");
  //         // element.classList.add("mine" + field.closer_mine);
  //         return {
  //           status: "play",
  //           result: result
  //         }
  //       }
  //     }
  // }

});
